import { NotFoundException } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

const makeStats = () => ({
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
});

describe('StatsController', () => {
  let controller: StatsController;
  let mockStatsService: { getStats: jest.Mock };

  beforeEach(() => {
    mockStatsService = {
      getStats: jest.fn().mockResolvedValue(makeStats()),
    };
    controller = new StatsController(mockStatsService as unknown as StatsService);
  });

  describe('GET /v1/stats/me', () => {
    it('returns UserStats when row exists', async () => {
      const result = await controller.getMyStats('u1', 'org-1');
      expect(result).toMatchObject({ userId: 'u1', totalExp: 100, level: 2 });
    });

    it('throws NotFoundException when no row exists', async () => {
      mockStatsService.getStats.mockResolvedValue(null);
      await expect(controller.getMyStats('u1', 'org-1')).rejects.toThrow(NotFoundException);
    });
  });
});
