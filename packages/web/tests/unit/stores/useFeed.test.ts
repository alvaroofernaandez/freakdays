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
  useAuthStore: () => ({ userId: 'user-123' }),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeFeedEntry = (id: string) => ({
  id,
  partyId: 'p1',
  actorUserId: 'u1',
  type: 'level.up',
  payload: { newLevel: 2 },
  sourceEventId: `evt-${id}`,
  createdAt: '2026-01-01T12:00:00.000Z',
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useFeedStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('(a) fetchFeed populates items newest-first', async () => {
    const entries = [makeFeedEntry('fe-1'), makeFeedEntry('fe-2')];
    mockGet.mockResolvedValueOnce({ items: entries, nextCursor: undefined });

    const { useFeedStore } = await import('../../../stores/useFeed');
    const store = useFeedStore();

    await store.fetchFeed('p1');

    expect(store.items).toHaveLength(2);
    expect(store.items[0]!.id).toBe('fe-1');
  });

  it('(b) prepend(entry) inserts at index 0', async () => {
    const { useFeedStore } = await import('../../../stores/useFeed');
    const store = useFeedStore();

    const existingEntry = makeFeedEntry('fe-old');
    mockGet.mockResolvedValueOnce({ items: [existingEntry], nextCursor: undefined });
    await store.fetchFeed('p1');

    const newEntry = makeFeedEntry('fe-new');
    store.prepend(newEntry);

    expect(store.items[0]!.id).toBe('fe-new');
    expect(store.items[1]!.id).toBe('fe-old');
  });

  it('(c) cursor advances on fetchMore', async () => {
    const { useFeedStore } = await import('../../../stores/useFeed');
    const store = useFeedStore();

    // First fetch
    const page1 = [makeFeedEntry('fe-1'), makeFeedEntry('fe-2')];
    mockGet.mockResolvedValueOnce({ items: page1, nextCursor: 'fe-2' });
    await store.fetchFeed('p1');

    expect(store.nextCursor).toBe('fe-2');

    // Second fetch (fetchMore)
    const page2 = [makeFeedEntry('fe-3')];
    mockGet.mockResolvedValueOnce({ items: page2, nextCursor: undefined });
    await store.fetchMore('p1');

    expect(store.items).toHaveLength(3);
    expect(store.nextCursor).toBeUndefined();
  });
});
