import { PrismaService } from '../../common/prisma/prisma.service';
import { EVENT_TYPES } from '../../events/event-types';
import type { DomainEvent, WorkoutLoggedPayload } from '../../events/event.types';
import { StreakHandler } from './streak.handler';

const makeEvent = (
  eventId: string,
  userId: string,
  orgId = 'org-1',
): DomainEvent<WorkoutLoggedPayload> => ({
  eventId,
  type: EVENT_TYPES.WORKOUT_LOGGED,
  aggregateId: 'workout-1',
  orgId,
  payload: {
    userId,
    orgId,
    workoutId: 'workout-1',
    loggedAt: new Date(),
  },
  occurredAt: new Date(),
});

const makeProfile = (overrides: Record<string, unknown> = {}) => ({
  id: 'p1',
  userId: 'u1',
  currentStreak: 1,
  longestStreak: 1,
  lastActivityDate: new Date('2026-01-01T12:00:00Z'),
  ...overrides,
});

describe('StreakHandler', () => {
  let handler: StreakHandler;
  let mockTx: {
    profile: { findUnique: jest.Mock; update: jest.Mock };
  };

  beforeEach(() => {
    mockTx = {
      profile: {
        findUnique: jest.fn().mockResolvedValue(makeProfile()),
        update: jest.fn().mockResolvedValue({}),
      },
    };

    handler = new StreakHandler(undefined as unknown as PrismaService);
  });

  describe('handles', () => {
    it('subscribes to all qualifying events', () => {
      expect(handler.handles).toContain(EVENT_TYPES.QUEST_COMPLETED);
      expect(handler.handles).toContain(EVENT_TYPES.WORKOUT_LOGGED);
      expect(handler.handles).toContain(EVENT_TYPES.ANIME_PROGRESSED);
      expect(handler.handles).toContain(EVENT_TYPES.ANIME_COMPLETED);
      expect(handler.handles).toContain(EVENT_TYPES.MANGA_PROGRESSED);
      expect(handler.handles).toContain(EVENT_TYPES.DAILY_LOGIN);
    });
  });

  describe('day+1: increment streak', () => {
    it('increments currentStreak when event is 1 day after lastActivityDate', async () => {
      const profile = makeProfile({
        lastActivityDate: new Date('2026-01-01T12:00:00Z'),
        currentStreak: 1,
        longestStreak: 1,
      });
      mockTx.profile.findUnique.mockResolvedValue(profile);

      // Event occurs on 2026-01-02 (day+1)
      const event: DomainEvent<WorkoutLoggedPayload> = {
        ...makeEvent('evt-day2', 'u1'),
        occurredAt: new Date('2026-01-02T15:00:00Z'),
      };

      await handler.handle(event, mockTx as unknown as Parameters<typeof handler.handle>[1]);

      expect(mockTx.profile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            currentStreak: 2,
            lastActivityDate: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('same day: no-op', () => {
    it('does NOT change streak for same-day duplicate', async () => {
      const profile = makeProfile({
        lastActivityDate: new Date('2026-01-02T08:00:00Z'),
        currentStreak: 2,
      });
      mockTx.profile.findUnique.mockResolvedValue(profile);

      const event: DomainEvent<WorkoutLoggedPayload> = {
        ...makeEvent('evt-sameday', 'u1'),
        occurredAt: new Date('2026-01-02T20:00:00Z'),
      };

      await handler.handle(event, mockTx as unknown as Parameters<typeof handler.handle>[1]);

      expect(mockTx.profile.update).not.toHaveBeenCalled();
    });
  });

  describe('gap > 1 day: reset streak', () => {
    it('resets currentStreak to 1 when gap > 1 day', async () => {
      const profile = makeProfile({
        lastActivityDate: new Date('2026-01-02T12:00:00Z'),
        currentStreak: 3,
        longestStreak: 3,
      });
      mockTx.profile.findUnique.mockResolvedValue(profile);

      // Event on 2026-01-04 — gap of 2 days
      const event: DomainEvent<WorkoutLoggedPayload> = {
        ...makeEvent('evt-gap', 'u1'),
        occurredAt: new Date('2026-01-04T12:00:00Z'),
      };

      await handler.handle(event, mockTx as unknown as Parameters<typeof handler.handle>[1]);

      expect(mockTx.profile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            currentStreak: 1,
          }),
        }),
      );
    });
  });

  describe('longestStreak update', () => {
    it('updates longestStreak when currentStreak exceeds it', async () => {
      const profile = makeProfile({
        lastActivityDate: new Date('2026-01-01T12:00:00Z'),
        currentStreak: 5,
        longestStreak: 5,
      });
      mockTx.profile.findUnique.mockResolvedValue(profile);

      const event: DomainEvent<WorkoutLoggedPayload> = {
        ...makeEvent('evt-longest', 'u1'),
        occurredAt: new Date('2026-01-02T12:00:00Z'),
      };

      await handler.handle(event, mockTx as unknown as Parameters<typeof handler.handle>[1]);

      expect(mockTx.profile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            currentStreak: 6,
            longestStreak: 6,
          }),
        }),
      );
    });
  });

  describe('no profile', () => {
    it('does nothing when profile not found', async () => {
      mockTx.profile.findUnique.mockResolvedValue(null);
      const event = makeEvent('evt-noprofile', 'u1');

      await handler.handle(event, mockTx as unknown as Parameters<typeof handler.handle>[1]);

      expect(mockTx.profile.update).not.toHaveBeenCalled();
    });
  });

  describe('new user: no lastActivityDate', () => {
    it('sets streak to 1 for first ever activity', async () => {
      const profile = makeProfile({
        lastActivityDate: null,
        currentStreak: 0,
        longestStreak: 0,
      });
      mockTx.profile.findUnique.mockResolvedValue(profile);

      const event = makeEvent('evt-first', 'u1');

      await handler.handle(event, mockTx as unknown as Parameters<typeof handler.handle>[1]);

      expect(mockTx.profile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            currentStreak: 1,
            longestStreak: 1,
          }),
        }),
      );
    });
  });
});
