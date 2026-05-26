import { PrismaService } from '../common/prisma/prisma.service';
import { OutboxRelayService } from './outbox-relay.service';

// Fake pending rows
const makePendingRow = (id: string, eventId: string) => ({
  id,
  eventId,
  type: 'quest.completed',
  aggregateId: 'quest-1',
  orgId: null,
  payload: { questId: 'quest-1', userId: 'u1', expAwarded: 10, level: 2 },
  occurredAt: new Date(),
  attempts: 0,
  availableAt: new Date(Date.now() - 1000),
  status: 'pending' as const,
});

describe('OutboxRelayService', () => {
  let service: OutboxRelayService;
  let mockPrisma: {
    outboxEvent: {
      updateMany: jest.Mock;
      update: jest.Mock;
      findMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let mockQueue: { add: jest.Mock };

  beforeEach(() => {
    mockQueue = { add: jest.fn().mockResolvedValue({}) };

    mockPrisma = {
      outboxEvent: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        update: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
      },
      $transaction: jest.fn().mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        return fn(mockPrisma);
      }),
    };

    service = new OutboxRelayService(mockPrisma as unknown as PrismaService, mockQueue as never);
  });

  describe('drain', () => {
    it('enqueues each pending row and marks it published', async () => {
      const row1 = makePendingRow('r1', 'evt-001');
      const row2 = makePendingRow('r2', 'evt-002');

      mockPrisma.outboxEvent.findMany.mockResolvedValueOnce([row1, row2]);

      await service.drain();

      expect(mockQueue.add).toHaveBeenCalledTimes(2);
      expect(mockQueue.add).toHaveBeenCalledWith(
        'domain-event',
        expect.objectContaining({ eventId: 'evt-001' }),
        expect.objectContaining({ jobId: 'evt-001' }),
      );
      expect(mockQueue.add).toHaveBeenCalledWith(
        'domain-event',
        expect.objectContaining({ eventId: 'evt-002' }),
        expect.objectContaining({ jobId: 'evt-002' }),
      );
      // Both rows updated to published
      expect(mockPrisma.outboxEvent.update).toHaveBeenCalledTimes(2);
      expect(mockPrisma.outboxEvent.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'published', processedAt: expect.any(Date) }),
        }),
      );
    });

    it('does NOT call queue.add when there are no pending rows', async () => {
      mockPrisma.outboxEvent.findMany.mockResolvedValueOnce([]);

      await service.drain();

      expect(mockQueue.add).not.toHaveBeenCalled();
      expect(mockPrisma.outboxEvent.update).not.toHaveBeenCalled();
    });

    it('on queue.add failure: increments attempts, sets back to pending, records lastError', async () => {
      const row = makePendingRow('r3', 'evt-fail');
      mockPrisma.outboxEvent.findMany.mockResolvedValueOnce([row]);
      mockQueue.add.mockRejectedValueOnce(new Error('Redis connection refused'));

      await service.drain();

      expect(mockPrisma.outboxEvent.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'r3' },
          data: expect.objectContaining({
            status: 'pending',
            attempts: 1,
            lastError: 'Redis connection refused',
            availableAt: expect.any(Date),
          }),
        }),
      );
    });

    it('does NOT re-pick rows with status=published', async () => {
      // findMany already filters — this test verifies the query args
      mockPrisma.outboxEvent.findMany.mockResolvedValueOnce([]);

      await service.drain();

      expect(mockPrisma.outboxEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'pending',
          }),
        }),
      );
    });
  });
});
