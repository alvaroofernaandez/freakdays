import { PrismaService } from '../../common/prisma/prisma.service';
import { MetricsService } from '../../observability/metrics.service';
import { OutboxRelayService } from '../outbox-relay.service';

const makePendingRow = (id: string, eventId: string) => ({
  id,
  eventId,
  type: 'quest.completed',
  aggregateId: 'quest-1',
  orgId: null,
  payload: { questId: 'q1', userId: 'u1', expAwarded: 10, level: 2 },
  occurredAt: new Date(),
  attempts: 0,
  availableAt: new Date(Date.now() - 1000),
  status: 'pending' as const,
});

describe('OutboxRelayService — MetricsService wiring', () => {
  let mockPrisma: {
    outboxEvent: { findMany: jest.Mock; update: jest.Mock; count: jest.Mock };
  };
  let mockQueue: { add: jest.Mock };
  let mockMetrics: {
    setOutboxBacklog: jest.Mock;
    recordHandler: jest.Mock;
    observeDuration: jest.Mock;
  };

  beforeEach(() => {
    mockQueue = { add: jest.fn().mockResolvedValue({}) };
    mockPrisma = {
      outboxEvent: {
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn().mockResolvedValue({}),
        count: jest.fn().mockResolvedValue(0),
      },
    };
    mockMetrics = {
      setOutboxBacklog: jest.fn(),
      recordHandler: jest.fn(),
      observeDuration: jest.fn(),
    };
  });

  function buildService(): OutboxRelayService {
    return new OutboxRelayService(
      mockPrisma as unknown as PrismaService,
      mockQueue as never,
      mockMetrics as unknown as MetricsService,
    );
  }

  describe('backlog gauge', () => {
    it('calls setOutboxBacklog with pending count after a successful drain', async () => {
      const rows = [makePendingRow('r1', 'evt-001')];
      mockPrisma.outboxEvent.findMany.mockResolvedValueOnce(rows);
      mockPrisma.outboxEvent.count.mockResolvedValueOnce(4);

      const service = buildService();
      await service.drain();

      expect(mockMetrics.setOutboxBacklog).toHaveBeenCalledWith(4);
    });

    it('does NOT call setOutboxBacklog when rows are empty (early return)', async () => {
      mockPrisma.outboxEvent.findMany.mockResolvedValueOnce([]);

      const service = buildService();
      await service.drain();

      expect(mockMetrics.setOutboxBacklog).not.toHaveBeenCalled();
    });
  });

  describe('@Optional() resilience', () => {
    it('works without MetricsService (undefined injected)', async () => {
      const rows = [makePendingRow('r2', 'evt-002')];
      mockPrisma.outboxEvent.findMany.mockResolvedValueOnce(rows);

      const service = new OutboxRelayService(
        mockPrisma as unknown as PrismaService,
        mockQueue as never,
        undefined,
      );

      await expect(service.drain()).resolves.toBeUndefined();
    });
  });
});
