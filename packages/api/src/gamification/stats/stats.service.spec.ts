import { PrismaService } from '../../common/prisma/prisma.service';
import { StatsService } from './stats.service';

const makeProfile = (overrides: Record<string, unknown> = {}) => ({
  totalExp: 100,
  level: 2,
  currentStreak: 3,
  longestStreak: 5,
  ...overrides,
});

const makeStats = (overrides: Record<string, unknown> = {}) => ({
  id: 'stats-1',
  userId: 'u1',
  organizationId: 'org-1',
  questsPending: 2,
  questsDoneToday: 1,
  animesInProgress: 1,
  workoutsThisWeek: 3,
  totalExp: 100,
  level: 2,
  currentStreak: 3,
  longestStreak: 5,
  achievementsCount: 2,
  windowDate: new Date('2026-05-26'),
  updatedAt: new Date(),
  ...overrides,
});

describe('StatsService', () => {
  let service: StatsService;
  let mockPrisma: {
    userStats: {
      findUnique: jest.Mock;
      upsert: jest.Mock;
    };
    profile: { findUnique: jest.Mock };
    quest: { count: jest.Mock };
    questCompletion: { count: jest.Mock };
    animeEntry: { count: jest.Mock };
    workoutSession: { count: jest.Mock };
    userAchievement: { count: jest.Mock };
  };

  beforeEach(() => {
    mockPrisma = {
      userStats: {
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockResolvedValue(makeStats()),
      },
      profile: {
        findUnique: jest.fn().mockResolvedValue(makeProfile()),
      },
      quest: {
        count: jest.fn().mockResolvedValue(2),
      },
      questCompletion: {
        count: jest.fn().mockResolvedValue(1),
      },
      animeEntry: {
        count: jest.fn().mockResolvedValue(1),
      },
      workoutSession: {
        count: jest.fn().mockResolvedValue(3),
      },
      userAchievement: {
        count: jest.fn().mockResolvedValue(2),
      },
    };

    service = new StatsService(mockPrisma as unknown as PrismaService);
  });

  describe('getStats', () => {
    it('returns null when no UserStats row exists', async () => {
      mockPrisma.userStats.findUnique.mockResolvedValue(null);
      const result = await service.getStats('u1', 'org-1');
      expect(result).toBeNull();
    });

    it('returns existing UserStats row without touching other tables', async () => {
      mockPrisma.userStats.findUnique.mockResolvedValue(makeStats());
      const result = await service.getStats('u1', 'org-1');
      expect(result).toMatchObject({ userId: 'u1', totalExp: 100, level: 2 });
      expect(mockPrisma.profile.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('rebuild', () => {
    it('computes all fields from source-of-truth tables', async () => {
      await service.rebuild('u1', 'org-1');

      expect(mockPrisma.profile.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'u1' } }),
      );
      expect(mockPrisma.quest.count).toHaveBeenCalled();
      expect(mockPrisma.questCompletion.count).toHaveBeenCalled();
      expect(mockPrisma.animeEntry.count).toHaveBeenCalled();
      expect(mockPrisma.workoutSession.count).toHaveBeenCalled();
      expect(mockPrisma.userAchievement.count).toHaveBeenCalled();
    });

    it('upserts UserStats with computed values', async () => {
      await service.rebuild('u1', 'org-1');

      expect(mockPrisma.userStats.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId_organizationId: { userId: 'u1', organizationId: 'org-1' },
          },
          create: expect.objectContaining({
            userId: 'u1',
            organizationId: 'org-1',
            totalExp: 100,
            level: 2,
            currentStreak: 3,
            longestStreak: 5,
          }),
          update: expect.objectContaining({
            totalExp: 100,
            level: 2,
          }),
        }),
      );
    });

    it('sets achievementsCount from UserAchievement count', async () => {
      mockPrisma.userAchievement.count.mockResolvedValue(4);
      await service.rebuild('u1', 'org-1');

      expect(mockPrisma.userStats.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ achievementsCount: 4 }),
          update: expect.objectContaining({ achievementsCount: 4 }),
        }),
      );
    });

    it('handles missing profile gracefully (no upsert)', async () => {
      mockPrisma.profile.findUnique.mockResolvedValue(null);
      await service.rebuild('u1', 'org-1');
      expect(mockPrisma.userStats.upsert).not.toHaveBeenCalled();
    });
  });
});
