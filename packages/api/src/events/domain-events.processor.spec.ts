import type { Job } from 'bullmq';

import { PrismaService } from '../common/prisma/prisma.service';
import { DomainEventsProcessor } from './domain-events.processor';
import { EVENT_TYPES } from './event-types';
import type { DomainEvent, QuestCompletedPayload } from './event.types';
import type { DomainEventHandler } from './interfaces/domain-event-handler.interface';

const makeJob = (event: DomainEvent): Job<DomainEvent> =>
  ({
    data: event,
    id: event.eventId,
  }) as Job<DomainEvent>;

const makeEvent = (
  eventId: string,
  type = EVENT_TYPES.QUEST_COMPLETED,
): DomainEvent<QuestCompletedPayload> => ({
  eventId,
  type,
  aggregateId: 'quest-1',
  orgId: null,
  payload: { questId: 'quest-1', userId: 'u1', expAwarded: 10, level: 2 },
  occurredAt: new Date(),
});

const makeHandler = (
  name: string,
  handles: (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES][],
): DomainEventHandler & { handle: jest.Mock } => ({
  name,
  handles,
  handle: jest.fn().mockResolvedValue(undefined),
});

describe('DomainEventsProcessor — registry + per-handler idempotency', () => {
  let processor: DomainEventsProcessor;
  let mockPrisma: {
    $transaction: jest.Mock;
    eventHandlerLog: { findUnique: jest.Mock; create: jest.Mock };
  };
  let questHandler: ReturnType<typeof makeHandler>;

  beforeEach(() => {
    questHandler = makeHandler('quest-handler', [EVENT_TYPES.QUEST_COMPLETED]);

    mockPrisma = {
      $transaction: jest.fn().mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        return fn(mockPrisma);
      }),
      eventHandlerLog: {
        findUnique: jest.fn().mockResolvedValue(null), // default: not yet processed
        create: jest.fn().mockResolvedValue({}),
      },
    };

    processor = new DomainEventsProcessor(
      mockPrisma as unknown as PrismaService,
      [questHandler] as DomainEventHandler[],
    );
    processor.onModuleInit();
  });

  describe('registry initialization', () => {
    it('builds registry from provided handlers', async () => {
      const job = makeJob(makeEvent('evt-new'));
      await processor.process(job);
      expect(questHandler.handle).toHaveBeenCalledTimes(1);
    });
  });

  describe('per-handler idempotency', () => {
    it('calls handler when no EventHandlerLog row exists', async () => {
      mockPrisma.eventHandlerLog.findUnique.mockResolvedValue(null);
      const job = makeJob(makeEvent('evt-new'));

      await processor.process(job);

      expect(questHandler.handle).toHaveBeenCalledTimes(1);
      expect(mockPrisma.eventHandlerLog.create).toHaveBeenCalledWith({
        data: { eventId: 'evt-new', handler: 'quest-handler' },
      });
    });

    it('skips handler when EventHandlerLog row already exists (replay is a no-op)', async () => {
      mockPrisma.eventHandlerLog.findUnique.mockResolvedValue({
        eventId: 'evt-seen',
        handler: 'quest-handler',
        processedAt: new Date(),
      });
      const job = makeJob(makeEvent('evt-seen'));

      await processor.process(job);

      expect(questHandler.handle).not.toHaveBeenCalled();
      expect(mockPrisma.eventHandlerLog.create).not.toHaveBeenCalled();
    });

    it('partial failure: re-run processes only un-logged handlers', async () => {
      const handlerA = makeHandler('handler-a', [EVENT_TYPES.QUEST_COMPLETED]);
      const handlerB = makeHandler('handler-b', [EVENT_TYPES.QUEST_COMPLETED]);

      // handlerA already logged, handlerB not
      mockPrisma.eventHandlerLog.findUnique.mockImplementation(
        ({ where }: { where: { eventId_handler: { handler: string } } }) => {
          if (where.eventId_handler.handler === 'handler-a') {
            return Promise.resolve({ eventId: 'evt-partial', handler: 'handler-a' });
          }
          return Promise.resolve(null);
        },
      );

      const p = new DomainEventsProcessor(
        mockPrisma as unknown as PrismaService,
        [handlerA, handlerB] as DomainEventHandler[],
      );
      p.onModuleInit();

      const job = makeJob(makeEvent('evt-partial'));
      await p.process(job);

      expect(handlerA.handle).not.toHaveBeenCalled(); // already logged
      expect(handlerB.handle).toHaveBeenCalledTimes(1); // not yet logged
    });
  });

  describe('unknown event types', () => {
    it('logs and skips when no handlers registered for event type', async () => {
      const unknownEvent: DomainEvent = {
        ...makeEvent('evt-unknown'),
        type: 'unknown.event' as DomainEvent['type'],
      };
      const job = makeJob(unknownEvent);

      await expect(processor.process(job)).resolves.not.toThrow();
      expect(questHandler.handle).not.toHaveBeenCalled();
    });
  });

  describe('error propagation', () => {
    it('propagates handler error so BullMQ retries the job', async () => {
      questHandler.handle.mockRejectedValue(new Error('Transient DB error'));
      mockPrisma.eventHandlerLog.findUnique.mockResolvedValue(null);
      const job = makeJob(makeEvent('evt-transient'));

      await expect(processor.process(job)).rejects.toThrow('Transient DB error');
    });
  });
});
