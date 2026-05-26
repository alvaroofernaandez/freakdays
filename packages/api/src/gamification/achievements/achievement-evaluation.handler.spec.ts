import { PrismaService } from '../../common/prisma/prisma.service';
import { EventBusService } from '../../events/event-bus.service';
import { EVENT_TYPES } from '../../events/event-types';
import type {
  DomainEvent,
  MangaProgressedPayload,
  QuestCompletedPayload,
  WorkoutLoggedPayload,
} from '../../events/event.types';
import { AchievementEvaluationHandler } from './achievement-evaluation.handler';

const makeQuestEvent = (
  eventId: string,
  userId = 'u1',
  orgId = 'org-1',
): DomainEvent<QuestCompletedPayload> => ({
  eventId,
  type: EVENT_TYPES.QUEST_COMPLETED,
  aggregateId: 'quest-1',
  orgId,
  payload: { questId: 'quest-1', userId, expAwarded: 50, level: 1 },
  occurredAt: new Date(),
});

const makeWorkoutEvent = (
  eventId: string,
  userId = 'u1',
  orgId = 'org-1',
): DomainEvent<WorkoutLoggedPayload> => ({
  eventId,
  type: EVENT_TYPES.WORKOUT_LOGGED,
  aggregateId: 'workout-1',
  orgId,
  payload: { userId, orgId, workoutId: 'workout-1', loggedAt: new Date() },
  occurredAt: new Date(),
});

const makeMangaProgressedEvent = (
  eventId: string,
  chaptersRead: number,
  userId = 'u1',
  orgId = 'org-1',
): DomainEvent<MangaProgressedPayload> => ({
  eventId,
  type: EVENT_TYPES.MANGA_PROGRESSED,
  aggregateId: 'manga-1',
  orgId,
  payload: {
    userId,
    orgId,
    mangaId: 'manga-1',
    chaptersRead,
    progressedAt: new Date(),
  },
  occurredAt: new Date(),
});

const makeProfile = (overrides: Record<string, unknown> = {}) => ({
  id: 'p1',
  userId: 'u1',
  totalExp: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  ...overrides,
});

describe('AchievementEvaluationHandler', () => {
  let handler: AchievementEvaluationHandler;
  let mockTx: {
    profile: { findUnique: jest.Mock };
    achievement: { findMany: jest.Mock };
    userAchievement: { findMany: jest.Mock; upsert: jest.Mock };
    questCompletion: { count: jest.Mock };
    workoutSession: { count: jest.Mock };
    animeEntry: { count: jest.Mock };
    mangaEntry: { findMany: jest.Mock };
    outboxEvent: { create: jest.Mock };
  };
  let mockEventBus: { emit: jest.Mock; buildEvent: jest.Mock };

  const primerPasoAchievement = {
    id: 'ach-1',
    code: 'primer-paso',
    name: 'Primer paso',
    description: 'First quest',
    triggers: [EVENT_TYPES.QUEST_COMPLETED],
    condition: { kind: 'counter', metric: 'questsCompleted', comparator: 'gte', value: 1 },
    active: true,
  };

  const semanaAchievement = {
    id: 'ach-2',
    code: 'semana-perfecta',
    name: 'Semana perfecta',
    description: '7 day streak',
    triggers: [EVENT_TYPES.QUEST_COMPLETED, EVENT_TYPES.WORKOUT_LOGGED, EVENT_TYPES.DAILY_LOGIN],
    condition: { kind: 'streak', metric: 'currentStreak', comparator: 'gte', value: 7 },
    active: true,
  };

  beforeEach(() => {
    mockTx = {
      profile: {
        findUnique: jest.fn().mockResolvedValue(makeProfile()),
      },
      achievement: {
        findMany: jest.fn().mockResolvedValue([primerPasoAchievement]),
      },
      userAchievement: {
        findMany: jest.fn().mockResolvedValue([]), // none unlocked yet
        upsert: jest.fn().mockResolvedValue({ id: 'ua-1' }),
      },
      questCompletion: { count: jest.fn().mockResolvedValue(1) },
      workoutSession: { count: jest.fn().mockResolvedValue(0) },
      animeEntry: { count: jest.fn().mockResolvedValue(0) },
      // findMany returns MangaEntry rows; ownedVolumes is Int[] (volume numbers owned).
      // chaptersRead = sum of ownedVolumes.length across entries (total volumes owned).
      mangaEntry: { findMany: jest.fn().mockResolvedValue([]) },
      outboxEvent: { create: jest.fn().mockResolvedValue({}) },
    };

    mockEventBus = {
      emit: jest.fn().mockResolvedValue(undefined),
      buildEvent: jest.fn().mockReturnValue({
        eventId: 'mock-ach-evt-id',
        type: EVENT_TYPES.ACHIEVEMENT_UNLOCKED,
        aggregateId: 'u1',
        orgId: 'org-1',
        payload: {},
        occurredAt: new Date(),
      }),
    };

    handler = new AchievementEvaluationHandler(
      undefined as unknown as PrismaService,
      mockEventBus as unknown as EventBusService,
    );
  });

  describe('primer-paso: unlocks on first quest completion', () => {
    it('upserts UserAchievement and emits achievement.unlocked', async () => {
      const event = makeQuestEvent('evt-1');
      await handler.handle(event, mockTx as unknown as Parameters<typeof handler.handle>[1]);

      expect(mockTx.userAchievement.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId_organizationId_achievementId: expect.objectContaining({
              achievementId: 'ach-1',
            }),
          }),
        }),
      );
      expect(mockEventBus.buildEvent).toHaveBeenCalledWith(
        EVENT_TYPES.ACHIEVEMENT_UNLOCKED,
        'u1',
        expect.objectContaining({ achievementCode: 'primer-paso' }),
        'org-1',
      );
      expect(mockEventBus.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe('idempotency: already unlocked does not emit again', () => {
    it('skips upsert and emit when already in UserAchievement', async () => {
      mockTx.userAchievement.findMany.mockResolvedValue([{ achievementId: 'ach-1' }]);

      const event = makeQuestEvent('evt-replay');
      await handler.handle(event, mockTx as unknown as Parameters<typeof handler.handle>[1]);

      expect(mockTx.userAchievement.upsert).not.toHaveBeenCalled();
      expect(mockEventBus.emit).not.toHaveBeenCalled();
    });
  });

  describe('semana-perfecta: triggers on streak >= 7', () => {
    it('unlocks when currentStreak is 7', async () => {
      mockTx.profile.findUnique.mockResolvedValue(makeProfile({ currentStreak: 7 }));
      mockTx.achievement.findMany.mockResolvedValue([semanaAchievement]);
      mockTx.userAchievement.findMany.mockResolvedValue([]);

      const event = makeQuestEvent('evt-streak7');
      await handler.handle(event, mockTx as unknown as Parameters<typeof handler.handle>[1]);

      expect(mockEventBus.buildEvent).toHaveBeenCalledWith(
        EVENT_TYPES.ACHIEVEMENT_UNLOCKED,
        'u1',
        expect.objectContaining({ achievementCode: 'semana-perfecta' }),
        'org-1',
      );
    });

    it('does NOT unlock when streak is below 7', async () => {
      mockTx.profile.findUnique.mockResolvedValue(makeProfile({ currentStreak: 6 }));
      mockTx.achievement.findMany.mockResolvedValue([semanaAchievement]);
      mockTx.userAchievement.findMany.mockResolvedValue([]);

      const event = makeWorkoutEvent('evt-streak6');
      await handler.handle(event, mockTx as unknown as Parameters<typeof handler.handle>[1]);

      expect(mockTx.userAchievement.upsert).not.toHaveBeenCalled();
      expect(mockEventBus.emit).not.toHaveBeenCalled();
    });
  });

  describe('nivel-5: triggers on level >= 5', () => {
    it('unlocks when profile level >= 5', async () => {
      const nivel5Achievement = {
        id: 'ach-3',
        code: 'nivel-5',
        name: 'Nivel 5',
        description: 'Level 5',
        triggers: [EVENT_TYPES.LEVEL_UP, EVENT_TYPES.QUEST_COMPLETED],
        condition: { kind: 'level', metric: 'level', comparator: 'gte', value: 5 },
        active: true,
      };
      mockTx.profile.findUnique.mockResolvedValue(makeProfile({ level: 5 }));
      mockTx.achievement.findMany.mockResolvedValue([nivel5Achievement]);
      mockTx.userAchievement.findMany.mockResolvedValue([]);

      const event = makeQuestEvent('evt-level5');
      await handler.handle(event, mockTx as unknown as Parameters<typeof handler.handle>[1]);

      expect(mockEventBus.buildEvent).toHaveBeenCalledWith(
        EVENT_TYPES.ACHIEVEMENT_UNLOCKED,
        'u1',
        expect.objectContaining({ achievementCode: 'nivel-5' }),
        'org-1',
      );
    });
  });

  // S1 — Lector achievement: counts real cumulative chapters (total volumes owned),
  // NOT the number of MangaEntry rows.
  describe('lector: unlocks at 50 chapters (total ownedVolumes across entries)', () => {
    const lectorAchievement = {
      id: 'ach-lector',
      code: 'lector',
      name: 'Lector',
      description: 'Lee 50 capítulos de manga.',
      triggers: [EVENT_TYPES.MANGA_PROGRESSED],
      condition: { kind: 'counter', metric: 'chaptersRead', comparator: 'gte', value: 50 },
      active: true,
    };

    it('unlocks Lector when total ownedVolumes across entries equals 50', async () => {
      // 3 manga entries owning a total of 50 volumes (= 50 "chapters" in this domain)
      mockTx.achievement.findMany.mockResolvedValue([lectorAchievement]);
      mockTx.userAchievement.findMany.mockResolvedValue([]);
      mockTx.mangaEntry.findMany.mockResolvedValue([
        { ownedVolumes: Array.from({ length: 20 }, (_, i) => i + 1) }, // 20 volumes
        { ownedVolumes: Array.from({ length: 20 }, (_, i) => i + 1) }, // 20 volumes
        { ownedVolumes: Array.from({ length: 10 }, (_, i) => i + 1) }, // 10 volumes
      ]);

      const event = makeMangaProgressedEvent('evt-lector-50', 5);
      await handler.handle(event, mockTx as unknown as Parameters<typeof handler.handle>[1]);

      expect(mockEventBus.buildEvent).toHaveBeenCalledWith(
        EVENT_TYPES.ACHIEVEMENT_UNLOCKED,
        'u1',
        expect.objectContaining({ achievementCode: 'lector' }),
        'org-1',
      );
    });

    it('does NOT unlock Lector when total ownedVolumes is below 50', async () => {
      mockTx.achievement.findMany.mockResolvedValue([lectorAchievement]);
      mockTx.userAchievement.findMany.mockResolvedValue([]);
      // Only 49 volumes total across entries
      mockTx.mangaEntry.findMany.mockResolvedValue([
        { ownedVolumes: Array.from({ length: 30 }, (_, i) => i + 1) }, // 30 volumes
        { ownedVolumes: Array.from({ length: 19 }, (_, i) => i + 1) }, // 19 volumes
      ]);

      const event = makeMangaProgressedEvent('evt-lector-49', 3);
      await handler.handle(event, mockTx as unknown as Parameters<typeof handler.handle>[1]);

      expect(mockTx.userAchievement.upsert).not.toHaveBeenCalled();
      expect(mockEventBus.emit).not.toHaveBeenCalled();
    });

    it('is idempotent — does NOT emit again when Lector is already unlocked', async () => {
      mockTx.achievement.findMany.mockResolvedValue([lectorAchievement]);
      mockTx.userAchievement.findMany.mockResolvedValue([{ achievementId: 'ach-lector' }]);
      mockTx.mangaEntry.findMany.mockResolvedValue([
        { ownedVolumes: Array.from({ length: 50 }, (_, i) => i + 1) },
      ]);

      const event = makeMangaProgressedEvent('evt-lector-replay', 5);
      await handler.handle(event, mockTx as unknown as Parameters<typeof handler.handle>[1]);

      expect(mockTx.userAchievement.upsert).not.toHaveBeenCalled();
      expect(mockEventBus.emit).not.toHaveBeenCalled();
    });
  });
});
