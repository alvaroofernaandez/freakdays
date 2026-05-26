import type { Job } from 'bullmq';

import { PrismaService } from '../../common/prisma/prisma.service';
import { MetricsService } from '../../observability/metrics.service';
import { DomainEventsProcessor } from '../domain-events.processor';
import { EVENT_TYPES } from '../event-types';
import type { DomainEvent, QuestCompletedPayload } from '../event.types';
import type { DomainEventHandler } from '../interfaces/domain-event-handler.interface';

const makeJob = (event: DomainEvent): Job<DomainEvent> =>
  ({ data: event, id: event.eventId }) as Job<DomainEvent>;

const makeEvent = (eventId: string): DomainEvent<QuestCompletedPayload> => ({
  eventId,
  type: EVENT_TYPES.QUEST_COMPLETED,
  aggregateId: 'quest-1',
  orgId: null,
  payload: { questId: 'q1', userId: 'u1', expAwarded: 10, level: 2 },
  occurredAt: new Date(),
});

const makeHandler = (
  name: string,
  impl?: () => Promise<void>,
): DomainEventHandler & { handle: jest.Mock } => ({
  name,
  handles: [EVENT_TYPES.QUEST_COMPLETED],
  handle: jest.fn().mockImplementation(impl ?? (() => Promise.resolve())),
});

describe('DomainEventsProcessor — MetricsService wiring', () => {
  let mockPrisma: {
    $transaction: jest.Mock;
    eventHandlerLog: { findUnique: jest.Mock; create: jest.Mock };
  };
  let mockMetrics: {
    recordHandler: jest.Mock;
    observeDuration: jest.Mock;
    setOutboxBacklog: jest.Mock;
  };

  beforeEach(() => {
    mockPrisma = {
      $transaction: jest
        .fn()
        .mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => fn(mockPrisma)),
      eventHandlerLog: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
      },
    };

    mockMetrics = {
      recordHandler: jest.fn(),
      observeDuration: jest.fn(),
      setOutboxBacklog: jest.fn(),
    };
  });

  function buildProcessor(handler: DomainEventHandler): DomainEventsProcessor {
    const processor = new DomainEventsProcessor(
      mockPrisma as unknown as PrismaService,
      [handler],
      mockMetrics as unknown as MetricsService,
    );
    processor.onModuleInit();
    return processor;
  }

  describe('success path', () => {
    it('calls metricsService.recordHandler once with the handler log context', async () => {
      const handler = makeHandler('feed-projector');
      const processor = buildProcessor(handler);

      await processor.process(makeJob(makeEvent('evt-metrics-success')));

      expect(mockMetrics.recordHandler).toHaveBeenCalledTimes(1);
      expect(mockMetrics.recordHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          handler: 'feed-projector',
          eventType: EVENT_TYPES.QUEST_COMPLETED,
          success: true,
        }),
      );
    });

    it('calls metricsService.observeDuration with handler, eventType and numeric ms', async () => {
      const handler = makeHandler('stats-projector');
      const processor = buildProcessor(handler);

      await processor.process(makeJob(makeEvent('evt-metrics-duration')));

      expect(mockMetrics.observeDuration).toHaveBeenCalledTimes(1);
      expect(mockMetrics.observeDuration).toHaveBeenCalledWith(
        'stats-projector',
        EVENT_TYPES.QUEST_COMPLETED,
        expect.any(Number),
      );
    });
  });

  describe('error path', () => {
    it('calls metricsService.recordHandler with success:false on handler error', async () => {
      const handler = makeHandler('failing-handler', async () => {
        throw new Error('handler blew up');
      });
      const processor = buildProcessor(handler);

      await expect(processor.process(makeJob(makeEvent('evt-metrics-error')))).rejects.toThrow(
        'handler blew up',
      );

      expect(mockMetrics.recordHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          handler: 'failing-handler',
          success: false,
          error: 'handler blew up',
        }),
      );
    });
  });

  describe('skipped / dedup path', () => {
    it('calls metricsService.recordHandler with skipped:true on dedup path', async () => {
      mockPrisma.eventHandlerLog.findUnique.mockResolvedValue({
        eventId: 'evt-skip',
        handler: 'feed-projector',
        processedAt: new Date(),
      });

      const handler = makeHandler('feed-projector');
      const processor = buildProcessor(handler);

      await processor.process(makeJob(makeEvent('evt-skip')));

      expect(mockMetrics.recordHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          handler: 'feed-projector',
          success: true,
          skipped: true,
        }),
      );
    });
  });

  describe('@Optional() resilience', () => {
    it('works without MetricsService (undefined injected)', async () => {
      const handler = makeHandler('no-metrics-handler');
      const processor = new DomainEventsProcessor(
        mockPrisma as unknown as PrismaService,
        [handler],
        undefined,
      );
      processor.onModuleInit();

      await expect(
        processor.process(makeJob(makeEvent('evt-no-metrics'))),
      ).resolves.toBeUndefined();
    });
  });
});
