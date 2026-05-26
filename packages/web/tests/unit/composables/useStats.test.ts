import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useStats } from '../../../app/composables/useStats';
import { useAuthStore } from '../../../stores/auth';

const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  normalizeApiError: vi.fn((error: unknown) =>
    typeof error === 'object' && error !== null
      ? (error as { message: string })
      : { message: 'error' },
  ),
};

const mockAuthRefresh = vi.fn().mockResolvedValue(undefined);

vi.mock('../../../app/composables/useApiClient', () => ({
  useApiClient: () => mockApi,
}));

vi.mock('../../../app/composables/useAuthContext', () => ({
  useAuthContext: () => ({
    refresh: mockAuthRefresh,
    getAccessToken: () => 'fake-token',
  }),
}));

const makeStatsRow = () => ({
  id: 'stats-1',
  userId: 'u1',
  organizationId: 'org-1',
  questsPending: 2,
  questsDoneToday: 1,
  animesInProgress: 1,
  workoutsThisWeek: 3,
  totalExp: 150,
  level: 2,
  currentStreak: 4,
  longestStreak: 7,
  achievementsCount: 3,
  windowDate: '2026-05-26T00:00:00.000Z',
  updatedAt: '2026-05-26T01:00:00.000Z',
});

describe('useStats', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('fetchStats', () => {
    it('returns null when no auth session', async () => {
      const authStore = useAuthStore();
      authStore.setSession(null);

      const statsApi = useStats();
      const result = await statsApi.fetchStats();

      expect(result).toBeNull();
      expect(mockApi.get).not.toHaveBeenCalled();
    });

    it('calls GET /v1/stats/me and returns mapped stats', async () => {
      const authStore = useAuthStore();
      authStore.setSession({ user: { id: 'u1' } } as never);
      mockApi.get.mockResolvedValueOnce(makeStatsRow());

      const statsApi = useStats();
      const result = await statsApi.fetchStats();

      expect(mockApi.get).toHaveBeenCalledWith('/v1/stats/me');
      expect(result).toMatchObject({
        questsPending: 2,
        questsDoneToday: 1,
        animesInProgress: 1,
        workoutsThisWeek: 3,
        totalExp: 150,
        level: 2,
        currentStreak: 4,
        longestStreak: 7,
        achievementsCount: 3,
      });
    });

    it('returns null when API throws (404 for new user)', async () => {
      const authStore = useAuthStore();
      authStore.setSession({ user: { id: 'u1' } } as never);
      mockApi.get.mockRejectedValueOnce(new Error('Not Found'));

      const statsApi = useStats();
      const result = await statsApi.fetchStats();

      expect(result).toBeNull();
    });
  });

  describe('toQuickStats', () => {
    it('maps UserStats to quickStats shape', () => {
      const statsApi = useStats();
      const quickStats = statsApi.toQuickStats(makeStatsRow() as never);

      expect(quickStats).toEqual({
        questsToday: 1,
        questsPending: 2,
        animeWatching: 1,
        workoutsThisWeek: 3,
      });
    });

    it('returns zeros for null input', () => {
      const statsApi = useStats();
      const quickStats = statsApi.toQuickStats(null);

      expect(quickStats).toEqual({
        questsToday: 0,
        questsPending: 0,
        animeWatching: 0,
        workoutsThisWeek: 0,
      });
    });
  });
});
