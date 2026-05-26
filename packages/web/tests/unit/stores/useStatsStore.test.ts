import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import type { UserStats } from '../../../app/composables/useStats';

// Mock useAuthStore
const mockAuthStore = { userId: 'user-123' as string | null };
vi.mock('../../../stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}));

// Mock useAuthContext
vi.mock('../../../app/composables/useAuthContext', () => ({
  useAuthContext: () => ({
    refresh: vi.fn().mockResolvedValue(undefined),
    getAccessToken: vi.fn().mockReturnValue('token'),
  }),
}));

// Mock useApiClient — will be overridden per test
const mockGet = vi.fn();
vi.mock('../../../app/composables/useApiClient', () => ({
  useApiClient: () => ({ get: mockGet }),
}));

// Mock useProfile for expForNextLevel
vi.mock('../../../app/composables/useProfile', () => ({
  useProfile: () => ({
    expForNextLevel: (exp: number) => ({
      current: exp % 1000,
      needed: 1000,
      progress: (exp % 1000) / 10,
    }),
  }),
}));

function makeStats(overrides: Partial<UserStats> = {}): UserStats {
  return {
    id: 's1',
    userId: 'user-123',
    organizationId: 'org-1',
    questsPending: 0,
    questsDoneToday: 0,
    animesInProgress: 0,
    workoutsThisWeek: 0,
    totalExp: 200,
    level: 2,
    currentStreak: 0,
    longestStreak: 0,
    achievementsCount: 0,
    windowDate: null,
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('useStatsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockAuthStore.userId = 'user-123';
  });

  it('(a) refresh() returns delta = next.totalExp - prev.totalExp', async () => {
    const { useStatsStore } = await import('../../../stores/useStatsStore');
    const store = useStatsStore();

    // First load: seed state to 200
    mockGet.mockResolvedValueOnce(makeStats({ totalExp: 200 }));
    await store.refresh();

    // Second load: 250 — delta should be 50
    mockGet.mockResolvedValueOnce(makeStats({ totalExp: 250 }));
    const delta = await store.refresh();

    expect(delta).toBe(50);
  });

  it('(b) first load returns delta 0 (prev seeded to next)', async () => {
    const { useStatsStore } = await import('../../../stores/useStatsStore');
    const store = useStatsStore();

    mockGet.mockResolvedValueOnce(makeStats({ totalExp: 500 }));
    const delta = await store.refresh();

    expect(delta).toBe(0);
  });

  it('(c) null fetch keeps prev stats and returns 0', async () => {
    const { useStatsStore } = await import('../../../stores/useStatsStore');
    const store = useStatsStore();

    // Seed with real stats
    mockGet.mockResolvedValueOnce(makeStats({ totalExp: 300 }));
    await store.refresh();

    // Now fetch returns null
    mockGet.mockRejectedValueOnce(new Error('network'));
    const delta = await store.refresh();

    expect(delta).toBe(0);
    expect(store.stats?.totalExp).toBe(300); // prev kept
  });

  it('(d) expProgress getter computes progress ratio', async () => {
    const { useStatsStore } = await import('../../../stores/useStatsStore');
    const store = useStatsStore();

    mockGet.mockResolvedValueOnce(makeStats({ totalExp: 750 }));
    await store.refresh();

    expect(store.expProgress).toBeDefined();
    expect(store.expProgress?.progress).toBeGreaterThanOrEqual(0);
  });

  it('(e) level getter matches stats.level', async () => {
    const { useStatsStore } = await import('../../../stores/useStatsStore');
    const store = useStatsStore();

    mockGet.mockResolvedValueOnce(makeStats({ totalExp: 200, level: 3 }));
    await store.refresh();

    expect(store.level).toBe(3);
  });

  it('totalExp getter returns stats.totalExp', async () => {
    const { useStatsStore } = await import('../../../stores/useStatsStore');
    const store = useStatsStore();

    mockGet.mockResolvedValueOnce(makeStats({ totalExp: 400 }));
    await store.refresh();

    expect(store.totalExp).toBe(400);
  });
});
