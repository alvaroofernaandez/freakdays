import { PrismaService } from '../../common/prisma/prisma.service';
import { OutboxRelayService } from '../outbox-relay.service';

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

describe('OutboxRelayService — structured log instrumentation', () => {
  let service: OutboxRelayService;
  let mockPrisma: {
    outboxEvent: { findMany: jest.Mock; update: jest.Mock };
  };
  let mockQueue: { add: jest.Mock };
  let mockLogger: { log: jest.Mock; warn: jest.Mock; error: jest.Mock };

  beforeEach(() => {
    mockQueue = { add: jest.fn().mockResolvedValue({}) };
    mockPrisma = {
      outboxEvent: {
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn().mockResolvedValue({}),
      },
    };

    service = new OutboxRelayService(mockPrisma as unknown as PrismaService, mockQueue as never);
    mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
    (service as unknown as { logger: typeof mockLogger }).logger = mockLogger;
  });

  describe('success path', () => {
    it('logs structured drain context with processedCount and durationMs >= 0 on success', async () => {
      const rows = [makePendingRow('r1', 'evt-001'), makePendingRow('r2', 'evt-002')];
      mockPrisma.outboxEvent.findMany.mockResolvedValueOnce(rows);

      await service.drain();

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          processedCount: 2,
          success: true,
          durationMs: expect.any(Number),
        }),
      );

      const ctx = mockLogger.log.mock.calls.find(
        ([c]: [Record<string, unknown>]) =>
          typeof c === 'object' && c !== null && 'processedCount' in c,
      )?.[0] as Record<string, unknown> | undefined;

      expect(typeof ctx?.durationMs).toBe('number');
      expect((ctx?.durationMs as number) >= 0).toBe(true);
    });

    it('does not call logger.log with drain context when rows list is empty (early return)', async () => {
      mockPrisma.outboxEvent.findMany.mockResolvedValueOnce([]);

      await service.drain();

      // No drain-summary log should be emitted on empty early-return path
      const drainLogCalls = mockLogger.log.mock.calls.filter(
        ([c]: [unknown]) =>
          typeof c === 'object' && c !== null && 'processedCount' in (c as object),
      );
      expect(drainLogCalls).toHaveLength(0);
    });
  });

  describe('error path', () => {
    it('logs success:false with error string on unexpected drain-level error', async () => {
      // Simulate an unexpected error BEFORE the per-row loop (findMany throws)
      mockPrisma.outboxEvent.findMany.mockRejectedValueOnce(new Error('DB connection lost'));

      await expect(service.drain()).rejects.toThrow('DB connection lost');

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'DB connection lost',
          durationMs: expect.any(Number),
        }),
      );
    });
  });
});
