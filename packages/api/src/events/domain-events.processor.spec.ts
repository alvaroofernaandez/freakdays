import type { Job } from 'bullmq';

import { PrismaService } from '../common/prisma/prisma.service';
import { DomainEventsProcessor } from './domain-events.processor';
import { EVENT_TYPES } from './event-types';
import type { DomainEvent, QuestCompletedPayload } from './event.types';

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

describe('DomainEventsProcessor', () => {
  let processor: DomainEventsProcessor;
  let mockPrisma: {
    processedEvent: { findUnique: jest.Mock; create: jest.Mock };
    $transaction: jest.Mock;
  };
  let mockQuestCompletedHandler: { handle: jest.Mock };

  beforeEach(() => {
    mockQuestCompletedHandler = { handle: jest.fn().mockResolvedValue(undefined) };

    mockPrisma = {
      processedEvent: {
        findUnique: jest.fn().mockResolvedValue(null), // default: not processed
        create: jest.fn().mockResolvedValue({}),
      },
      $transaction: jest.fn().mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        return fn(mockPrisma);
      }),
    };

    processor = new DomainEventsProcessor(
      mockPrisma as unknown as PrismaService,
      mockQuestCompletedHandler as never,
    );
  });

  describe('process', () => {
    it('calls handler once for a new eventId', async () => {
      mockPrisma.processedEvent.findUnique.mockResolvedValue(null);
      const job = makeJob(makeEvent('evt-new'));

      await processor.process(job);

      expect(mockQuestCompletedHandler.handle).toHaveBeenCalledTimes(1);
    });

    it('does NOT call handler for an already-processed eventId', async () => {
      mockPrisma.processedEvent.findUnique.mockResolvedValue({
        eventId: 'evt-seen',
        type: EVENT_TYPES.QUEST_COMPLETED,
        processedAt: new Date(),
      });
      const job = makeJob(makeEvent('evt-seen'));

      await processor.process(job);

      expect(mockQuestCompletedHandler.handle).not.toHaveBeenCalled();
    });

    it('propagates handler error so BullMQ retries the job', async () => {
      mockPrisma.processedEvent.findUnique.mockResolvedValue(null);
      mockQuestCompletedHandler.handle.mockRejectedValue(new Error('Transient DB error'));
      const job = makeJob(makeEvent('evt-transient'));

      await expect(processor.process(job)).rejects.toThrow('Transient DB error');
    });

    it('routes quest.completed events to QuestCompletedHandler', async () => {
      mockPrisma.processedEvent.findUnique.mockResolvedValue(null);
      const job = makeJob(makeEvent('evt-route', EVENT_TYPES.QUEST_COMPLETED));

      await processor.process(job);

      expect(mockQuestCompletedHandler.handle).toHaveBeenCalledWith(
        job.data,
        expect.anything(), // tx
      );
    });

    it('logs and skips unknown event types without calling handler', async () => {
      mockPrisma.processedEvent.findUnique.mockResolvedValue(null);
      const unknownEvent: DomainEvent = {
        ...makeEvent('evt-unknown'),
        type: 'unknown.event' as DomainEvent['type'],
      };
      const job = makeJob(unknownEvent);

      // Should not throw even though there's no handler
      await expect(processor.process(job)).resolves.not.toThrow();
      expect(mockQuestCompletedHandler.handle).not.toHaveBeenCalled();
    });
  });
});
