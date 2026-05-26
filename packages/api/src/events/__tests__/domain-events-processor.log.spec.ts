import type { Job } from 'bullmq';

import { PrismaService } from '../../common/prisma/prisma.service';
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
  payload: { questId: 'quest-1', userId: 'u1', expAwarded: 10, level: 2 },
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

describe('DomainEventsProcessor — structured log instrumentation', () => {
  let mockPrisma: {
    $transaction: jest.Mock;
    eventHandlerLog: { findUnique: jest.Mock; create: jest.Mock };
  };
  let mockLogger: { log: jest.Mock; warn: jest.Mock; error: jest.Mock };

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

    mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
  });

  function buildProcessor(handler: DomainEventHandler): DomainEventsProcessor {
    const processor = new DomainEventsProcessor(mockPrisma as unknown as PrismaService, [handler]);
    // Inject mock logger so we can assert structured log calls
    (processor as unknown as { logger: typeof mockLogger }).logger = mockLogger;
    processor.onModuleInit();
    return processor;
  }

  describe('success path', () => {
    it('calls logger.log with success:true and durationMs >= 0 after handler completes', async () => {
      const handler = makeHandler('feed-projector');
      const processor = buildProcessor(handler);

      await processor.process(makeJob(makeEvent('evt-log-success')));

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          handler: 'feed-projector',
          eventType: EVENT_TYPES.QUEST_COMPLETED,
          eventId: 'evt-log-success',
          success: true,
          durationMs: expect.any(Number),
        }),
      );

      const ctx = mockLogger.log.mock.calls.find(
        ([c]: [Record<string, unknown>]) => c.handler === 'feed-projector',
      )?.[0] as Record<string, unknown> | undefined;
      expect(typeof ctx?.durationMs).toBe('number');
      expect((ctx?.durationMs as number) >= 0).toBe(true);
    });
  });

  describe('error path', () => {
    it('calls logger.error with success:false and error string, then rethrows', async () => {
      const handler = makeHandler('stats-projector', async () => {
        throw new Error('DB timeout');
      });
      const processor = buildProcessor(handler);

      await expect(processor.process(makeJob(makeEvent('evt-log-error')))).rejects.toThrow(
        'DB timeout',
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          handler: 'stats-projector',
          eventType: EVENT_TYPES.QUEST_COMPLETED,
          eventId: 'evt-log-error',
          success: false,
          error: 'DB timeout',
          durationMs: expect.any(Number),
        }),
      );
    });
  });

  describe('dedup / skipped path', () => {
    it('calls logger.log with skipped:true when EventHandlerLog row already exists', async () => {
      mockPrisma.eventHandlerLog.findUnique.mockResolvedValue({
        eventId: 'evt-log-skip',
        handler: 'feed-projector',
        processedAt: new Date(),
      });

      const handler = makeHandler('feed-projector');
      const processor = buildProcessor(handler);

      await processor.process(makeJob(makeEvent('evt-log-skip')));

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({
          handler: 'feed-projector',
          eventType: EVENT_TYPES.QUEST_COMPLETED,
          eventId: 'evt-log-skip',
          success: true,
          skipped: true,
        }),
      );

      // Handler must NOT be called on dedup path
      expect(handler.handle).not.toHaveBeenCalled();
    });
  });

  describe('invariants', () => {
    it('rethrow on error path preserves BullMQ retry semantics', async () => {
      const handler = makeHandler('retry-handler', async () => {
        throw new Error('Transient');
      });
      const processor = buildProcessor(handler);

      await expect(processor.process(makeJob(makeEvent('evt-retry')))).rejects.toThrow('Transient');
    });

    it('dedup semantics unchanged: handler is still NOT called when already processed', async () => {
      mockPrisma.eventHandlerLog.findUnique.mockResolvedValue({ eventId: 'e', handler: 'h' });
      const handler = makeHandler('h');
      const processor = buildProcessor(handler);

      await processor.process(makeJob(makeEvent('e')));

      expect(handler.handle).not.toHaveBeenCalled();
    });
  });
});
