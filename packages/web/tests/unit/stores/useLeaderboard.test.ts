import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockGet = vi.fn();
vi.mock('../../../app/composables/useApiClient', () => ({
  useApiClient: () => ({ get: mockGet }),
}));

vi.mock('../../../app/composables/useAuthContext', () => ({
  useAuthContext: () => ({
    refresh: vi.fn().mockResolvedValue(undefined),
    getAccessToken: vi.fn().mockReturnValue('token'),
  }),
}));

vi.mock('../../../stores/auth', () => ({
  useAuthStore: () => ({ userId: 'user-current' }),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeRow = (userId: string, rank: number, totalExp = 1000) => ({
  rank,
  userId,
  displayName: `User ${userId}`,
  avatarUrl: null,
  totalExp,
  level: 5,
  currentStreak: 3,
  isCurrentUser: userId === 'user-current',
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useLeaderboardStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('(a) fetchPartyLeaderboard populates rows with yourRank', async () => {
    const rows = [makeRow('user-a', 1, 2000), makeRow('user-current', 2, 1000)];
    mockGet.mockResolvedValueOnce({ items: rows, yourRank: 2, total: 2, page: 1 });

    const { useLeaderboardStore } = await import('../../../stores/useLeaderboard');
    const store = useLeaderboardStore();

    await store.fetchPartyLeaderboard('p1', 1);

    expect(store.partyRows).toHaveLength(2);
    expect(store.yourRank).toBe(2);
    expect(store.total).toBe(2);
  });

  it('(b) currentUserRow getter returns row where isCurrentUser=true', async () => {
    const rows = [makeRow('user-a', 1, 2000), makeRow('user-current', 2, 1000)];
    mockGet.mockResolvedValueOnce({ items: rows, yourRank: 2, total: 2, page: 1 });

    const { useLeaderboardStore } = await import('../../../stores/useLeaderboard');
    const store = useLeaderboardStore();

    await store.fetchPartyLeaderboard('p1', 1);

    expect(store.currentUserRow?.userId).toBe('user-current');
  });

  it('(c) fetchGlobal populates globalRows with yourRank/null when not opted-in', async () => {
    const rows = [makeRow('user-x', 1, 800)];
    mockGet.mockResolvedValueOnce({ items: rows, yourRank: null, total: 1, page: 1 });

    const { useLeaderboardStore } = await import('../../../stores/useLeaderboard');
    const store = useLeaderboardStore();

    await store.fetchGlobal(1);

    expect(store.globalRows).toHaveLength(1);
    expect(store.yourRank).toBeNull();
  });
});
