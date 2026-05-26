import { NotFoundException } from '@nestjs/common';

// ClerkJwtGuard imports the jose library (ESM) which Jest (CommonJS mode) cannot
// parse without special transform config. Mock the entire guard module so that
// importing StatsController (which has @UseGuards(ClerkJwtGuard)) doesn't fail.
jest.mock('../../auth/guards/clerk-jwt.guard', () => ({
  ClerkJwtGuard: class ClerkJwtGuard {},
}));

import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

// NestJS stores guards registered via @UseGuards under this metadata key
const GUARDS_METADATA = '__guards__';

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

  // W1 — explicit guard: StatsController must declare ClerkJwtGuard at class level
  describe('W1 — explicit @UseGuards(ClerkJwtGuard) at class level', () => {
    it('applies a guard via class-level @UseGuards decorator (not only via global APP_GUARD)', () => {
      // Retrieve guards metadata set by @UseGuards on the controller class.
      // We avoid importing ClerkJwtGuard directly because it pulls in the jose ESM
      // package which Jest (CJS transform) cannot load without special config.
      // Instead, assert by the guard class name to keep the test lightweight.
      const guards: (new (...args: unknown[]) => unknown)[] =
        Reflect.getMetadata(GUARDS_METADATA, StatsController) ?? [];
      expect(guards.length).toBeGreaterThan(0);
      expect(guards.some((g) => g.name === 'ClerkJwtGuard')).toBe(true);
    });
  });
});
