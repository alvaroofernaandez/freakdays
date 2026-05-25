import { computeLevel } from '@freakdays/domain';

import { PrismaService } from '../../common/prisma/prisma.service';
import { EventBusService } from '../../events/event-bus.service';
import { EVENT_TYPES } from '../../events/event-types';
import type {
  DomainEvent,
  WorkoutLoggedPayload,
  QuestCompletedPayload,
} from '../../events/event.types';
import { ProgressionHandler } from './progression.handler';

const makeWorkoutEvent = (eventId: string): DomainEvent<WorkoutLoggedPayload> => ({
  eventId,
  type: EVENT_TYPES.WORKOUT_LOGGED,
  aggregateId: 'workout-1',
  orgId: 'org-1',
  payload: {
    userId: 'u1',
    orgId: 'org-1',
    workoutId: 'workout-1',
    loggedAt: new Date(),
  },
  occurredAt: new Date(),
});

const makeQuestEvent = (
  eventId: string,
  expAwarded: number,
): DomainEvent<QuestCompletedPayload> => ({
  eventId,
  type: EVENT_TYPES.QUEST_COMPLETED,
  aggregateId: 'quest-1',
  orgId: 'org-1',
  payload: {
    questId: 'quest-1',
    userId: 'u1',
    expAwarded,
    level: 1,
  },
  occurredAt: new Date(),
});

describe('ProgressionHandler', () => {
  let handler: ProgressionHandler;
  let mockPrisma: PrismaService;
  let mockEventBus: EventBusService;
  let mockTx: {
    profile: { findUnique: jest.Mock; update: jest.Mock };
    eventHandlerLog: { findUnique: jest.Mock };
    outboxEvent: { create: jest.Mock };
  };

  const baseProfile = {
    id: 'p1',
    userId: 'u1',
    totalExp: 50,
    level: 1,
    currentStreak: 0,
  };

  beforeEach(() => {
    mockTx = {
      profile: {
        findUnique: jest.fn().mockResolvedValue(baseProfile),
        update: jest.fn().mockResolvedValue({}),
      },
      eventHandlerLog: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      outboxEvent: {
        create: jest.fn().mockResolvedValue({}),
      },
    };

    const mockEventBusInstance = {
      buildEvent: jest.fn().mockReturnValue({
        eventId: 'mock-level-up-id',
        type: EVENT_TYPES.LEVEL_UP,
        aggregateId: 'u1',
        orgId: 'org-1',
        payload: {},
        occurredAt: new Date(),
      }),
      emit: jest.fn().mockResolvedValue(undefined),
    };

    mockPrisma = undefined as unknown as PrismaService;
    mockEventBus = mockEventBusInstance as unknown as EventBusService;

    handler = new ProgressionHandler(mockPrisma, mockEventBus);
  });

  describe('handles', () => {
    it('includes WORKOUT_LOGGED, QUEST_COMPLETED, ANIME_PROGRESSED, ANIME_COMPLETED, MANGA_PROGRESSED, DAILY_LOGIN', () => {
      expect(handler.handles).toContain(EVENT_TYPES.WORKOUT_LOGGED);
      expect(handler.handles).toContain(EVENT_TYPES.QUEST_COMPLETED);
      expect(handler.handles).toContain(EVENT_TYPES.ANIME_PROGRESSED);
      expect(handler.handles).toContain(EVENT_TYPES.ANIME_COMPLETED);
      expect(handler.handles).toContain(EVENT_TYPES.MANGA_PROGRESSED);
      expect(handler.handles).toContain(EVENT_TYPES.DAILY_LOGIN);
    });
  });

  describe('EXP grant', () => {
    it('grants 30 EXP for workout.logged on first delivery', async () => {
      const event = makeWorkoutEvent('evt-1');
      await handler.handle(event, mockTx as unknown as Parameters<typeof handler.handle>[1]);

      expect(mockTx.profile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalExp: 80, // 50 + 30
            level: computeLevel(80),
          }),
        }),
      );
    });

    it('applies streak bonus from profile.currentStreak — streak=7 → floor(30*1.05)=31', async () => {
      // streak=7 is on the profile — ProgressionHandler reads it directly
      mockTx.profile.findUnique.mockResolvedValue({
        ...baseProfile,
        totalExp: 50,
        currentStreak: 7,
      });
      const event = makeWorkoutEvent('evt-streak');

      await handler.handle(event, mockTx as unknown as Parameters<typeof handler.handle>[1]);

      expect(mockTx.profile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalExp: 50 + 31, // 81 — floor(30 * 1.05) = 31
          }),
        }),
      );
    });

    it('does nothing if profile not found', async () => {
      mockTx.profile.findUnique.mockResolvedValue(null);
      const event = makeWorkoutEvent('evt-noprofile');

      await handler.handle(event, mockTx as unknown as Parameters<typeof handler.handle>[1]);

      expect(mockTx.profile.update).not.toHaveBeenCalled();
    });
  });

  describe('level.up emission', () => {
    it('emits level.up when EXP grant crosses level boundary', async () => {
      // totalExp=95 + 30 EXP = 125 → crosses level 2
      mockTx.profile.findUnique.mockResolvedValue({ ...baseProfile, totalExp: 95 });
      const event = makeWorkoutEvent('evt-levelup');

      await handler.handle(event, mockTx as unknown as Parameters<typeof handler.handle>[1]);

      expect(mockEventBus.buildEvent).toHaveBeenCalledWith(
        EVENT_TYPES.LEVEL_UP,
        'u1',
        expect.objectContaining({ previousLevel: 1, newLevel: 2, totalExp: 125 }),
        'org-1',
      );
      expect(mockEventBus.emit).toHaveBeenCalledTimes(1);
    });

    it('does NOT emit level.up when level does not change', async () => {
      // totalExp=50 + 30 = 80 → still level 1
      const event = makeWorkoutEvent('evt-nolevelup');
      await handler.handle(event, mockTx as unknown as Parameters<typeof handler.handle>[1]);

      expect(mockEventBus.emit).not.toHaveBeenCalled();
    });

    it('emits single level.up even when multiple levels are crossed', async () => {
      // totalExp=95 + 310 = 405 → level 5
      mockTx.profile.findUnique.mockResolvedValue({ ...baseProfile, totalExp: 95 });
      const questEvent = makeQuestEvent('evt-bigquest', 310);

      await handler.handle(questEvent, mockTx as unknown as Parameters<typeof handler.handle>[1]);

      expect(mockEventBus.emit).toHaveBeenCalledTimes(1);
      expect(mockEventBus.buildEvent).toHaveBeenCalledWith(
        EVENT_TYPES.LEVEL_UP,
        'u1',
        expect.objectContaining({ previousLevel: 1, newLevel: 5, totalExp: 405 }),
        expect.anything(),
      );
    });
  });
});
