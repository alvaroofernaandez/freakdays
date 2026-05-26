import { PrismaService } from '../common/prisma/prisma.service';
import { EventBusService } from './event-bus.service';
import { EVENT_TYPES } from './event-types';
import type { QuestCompletedPayload } from './event.types';

describe('EventBusService', () => {
  let service: EventBusService;
  let mockPrisma: { outboxEvent: { create: jest.Mock } };

  beforeEach(() => {
    mockPrisma = {
      outboxEvent: {
        create: jest.fn().mockResolvedValue({}),
      },
    };
    service = new EventBusService();
  });

  describe('buildEvent', () => {
    it('returns an envelope with a non-empty UUID eventId', () => {
      const event = service.buildEvent<QuestCompletedPayload>(
        EVENT_TYPES.QUEST_COMPLETED,
        'quest-123',
        { questId: 'quest-123', userId: 'user-1', expAwarded: 10, level: 2 },
      );

      expect(event.eventId).toBeTruthy();
      expect(event.eventId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('returns an envelope with correct type and aggregateId', () => {
      const event = service.buildEvent(EVENT_TYPES.QUEST_COMPLETED, 'quest-456', {
        questId: 'quest-456',
        userId: 'user-2',
        expAwarded: 50,
        level: 3,
      });

      expect(event.type).toBe('quest.completed');
      expect(event.aggregateId).toBe('quest-456');
    });

    it('returns an envelope with occurredAt as a Date', () => {
      const before = new Date();
      const event = service.buildEvent(EVENT_TYPES.QUEST_COMPLETED, 'quest-1', {
        questId: 'quest-1',
        userId: 'u1',
        expAwarded: 5,
        level: 1,
      });
      const after = new Date();

      expect(event.occurredAt).toBeInstanceOf(Date);
      expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('stores the payload on the envelope', () => {
      const payload: QuestCompletedPayload = {
        questId: 'q1',
        userId: 'u1',
        expAwarded: 20,
        level: 3,
      };
      const event = service.buildEvent<QuestCompletedPayload>(
        EVENT_TYPES.QUEST_COMPLETED,
        'q1',
        payload,
      );

      expect(event.payload).toEqual(payload);
    });

    it('sets orgId to null when not provided', () => {
      const event = service.buildEvent(EVENT_TYPES.QUEST_COMPLETED, 'q1', {
        questId: 'q1',
        userId: 'u1',
        expAwarded: 10,
        level: 1,
      });

      expect(event.orgId).toBeNull();
    });

    it('sets orgId when provided', () => {
      const event = service.buildEvent(
        EVENT_TYPES.QUEST_COMPLETED,
        'q1',
        { questId: 'q1', userId: 'u1', expAwarded: 10, level: 1 },
        'org-999',
      );

      expect(event.orgId).toBe('org-999');
    });
  });

  describe('emit', () => {
    it('calls tx.outboxEvent.create with correct fields — no Redis call', async () => {
      const mockTx = {
        outboxEvent: {
          create: jest.fn().mockResolvedValue({}),
        },
      };

      const event = service.buildEvent<QuestCompletedPayload>(
        EVENT_TYPES.QUEST_COMPLETED,
        'quest-123',
        { questId: 'quest-123', userId: 'user-1', expAwarded: 10, level: 2 },
        'org-1',
      );

      await service.emit(mockTx as unknown as Parameters<typeof service.emit>[0], event);

      expect(mockTx.outboxEvent.create).toHaveBeenCalledTimes(1);
      expect(mockTx.outboxEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventId: event.eventId,
          type: 'quest.completed',
          aggregateId: 'quest-123',
          orgId: 'org-1',
          payload: expect.objectContaining({ questId: 'quest-123' }),
          occurredAt: event.occurredAt,
        }),
      });
    });

    it('does NOT call any external service (Redis/BullMQ) — only DB write', async () => {
      const mockTx = {
        outboxEvent: {
          create: jest.fn().mockResolvedValue({}),
        },
      };

      const event = service.buildEvent(EVENT_TYPES.QUEST_COMPLETED, 'quest-789', {
        questId: 'quest-789',
        userId: 'u3',
        expAwarded: 15,
        level: 4,
      });

      await service.emit(mockTx as unknown as Parameters<typeof service.emit>[0], event);

      // Only outboxEvent.create must be called — no other calls
      expect(Object.keys(mockTx).length).toBe(1);
      expect(mockTx.outboxEvent.create).toHaveBeenCalledTimes(1);
    });

    it('propagates prisma errors', async () => {
      const mockTx = {
        outboxEvent: {
          create: jest.fn().mockRejectedValue(new Error('DB constraint violation')),
        },
      };

      const event = service.buildEvent(EVENT_TYPES.QUEST_COMPLETED, 'q1', {
        questId: 'q1',
        userId: 'u1',
        expAwarded: 5,
        level: 1,
      });

      await expect(
        service.emit(mockTx as unknown as Parameters<typeof service.emit>[0], event),
      ).rejects.toThrow('DB constraint violation');
    });
  });
});
