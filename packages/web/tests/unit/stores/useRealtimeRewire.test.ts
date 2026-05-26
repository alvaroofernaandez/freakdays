import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { WIRE_EVENTS } from '@freakdays/domain';

// Simulate socket event capture
const listenerRegistry: Record<string, (...args: unknown[]) => void> = {};

const mockSocket = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
    listenerRegistry[event] = handler;
  }),
  off: vi.fn(),
  emit: vi.fn(),
  connected: false,
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

vi.mock('@freakdays/domain', () => ({
  WIRE_EVENTS: {
    LEVEL_UP: 'level_up',
    ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
    STATS_UPDATED: 'stats_updated',
  },
}));

const mockAuthStore = { userId: 'user-test-id' as string | null };
vi.mock('../../../stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}));

// Toast should NOT be called in the rewired store
const mockToastSuccess = vi.fn();
vi.mock('../../../app/composables/useToast', () => ({
  useToast: () => ({ success: mockToastSuccess }),
}));

vi.mock('../../../app/composables/useAuthContext', () => ({
  useAuthContext: () => ({
    refresh: vi.fn().mockResolvedValue(undefined),
    getAccessToken: vi.fn().mockReturnValue('token'),
  }),
}));

vi.mock('../../../app/composables/useProfile', () => ({
  useProfile: () => ({
    expForNextLevel: (exp: number) => ({
      current: exp % 1000,
      needed: 1000,
      progress: (exp % 1000) / 10,
    }),
  }),
}));

// Celebrations store mock
const mockEnqueue = vi.fn();
const mockAddFloat = vi.fn();
vi.mock('../../../stores/useCelebrations', () => ({
  useCelebrationsStore: () => ({
    enqueue: mockEnqueue,
    addFloat: mockAddFloat,
  }),
}));

// Sound store mock
const mockPlayLevelUp = vi.fn();
const mockPlayAchievement = vi.fn();
const mockPlayXp = vi.fn();
vi.mock('../../../stores/useSound', () => ({
  useSoundStore: () => ({
    playLevelUp: mockPlayLevelUp,
    playAchievement: mockPlayAchievement,
    playXp: mockPlayXp,
  }),
}));

// Stats store mock — returns delta from refresh
let mockRefreshDelta = 0;
const mockStatsRefresh = vi.fn().mockImplementation(() => Promise.resolve(mockRefreshDelta));
vi.mock('../../../stores/useStatsStore', () => ({
  useStatsStore: () => ({
    refresh: mockStatsRefresh,
  }),
}));

// useStats mock for backward compat (useRealtime still imports it for connect)
const mockFetchStats = vi.fn().mockResolvedValue(null);
vi.mock('../../../app/composables/useStats', () => ({
  useStats: () => ({ fetchStats: mockFetchStats }),
}));

describe('useRealtime — rewired events (Slice E)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    for (const key of Object.keys(listenerRegistry)) {
      Reflect.deleteProperty(listenerRegistry, key);
    }
    mockAuthStore.userId = 'user-test-id';
    mockRefreshDelta = 0;
    mockStatsRefresh.mockImplementation(() => Promise.resolve(mockRefreshDelta));
  });

  async function connectStore() {
    const { useRealtimeStore } = await import('../../../stores/useRealtime');
    const store = useRealtimeStore();
    store.connect(mockSocket as never);
    return store;
  }

  it('(a) onLevelUp enqueues celebration + calls playLevelUp, emits NO toast', async () => {
    await connectStore();

    const handler = listenerRegistry[WIRE_EVENTS.LEVEL_UP];
    handler({ newLevel: 5 });

    expect(mockEnqueue).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'level_up', level: 5 }),
    );
    expect(mockPlayLevelUp).toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('(b) onAchievementUnlocked enqueues achievement + calls playAchievement, emits NO toast', async () => {
    await connectStore();

    const handler = listenerRegistry[WIRE_EVENTS.ACHIEVEMENT_UNLOCKED];
    handler({ name: 'Primer login' });

    expect(mockEnqueue).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'achievement', name: 'Primer login' }),
    );
    expect(mockPlayAchievement).toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('(c) onStatsUpdated calls statsStore.refresh() and if delta > 0 adds float + calls playXp', async () => {
    mockRefreshDelta = 50;
    mockStatsRefresh.mockResolvedValue(50);

    await connectStore();

    const handler = listenerRegistry[WIRE_EVENTS.STATS_UPDATED];
    handler({});

    await new Promise((r) => setTimeout(r, 10));

    expect(mockStatsRefresh).toHaveBeenCalled();
    expect(mockAddFloat).toHaveBeenCalledWith(50);
    expect(mockPlayXp).toHaveBeenCalled();
  });

  it('(d) onStatsUpdated delta = 0 → no float enqueued', async () => {
    mockRefreshDelta = 0;
    mockStatsRefresh.mockResolvedValue(0);

    await connectStore();

    const handler = listenerRegistry[WIRE_EVENTS.STATS_UPDATED];
    handler({});

    await new Promise((r) => setTimeout(r, 10));

    expect(mockAddFloat).not.toHaveBeenCalled();
    expect(mockPlayXp).not.toHaveBeenCalled();
  });

  it('(e) onConnect calls statsStore.refresh()', async () => {
    await connectStore();

    const handler = listenerRegistry['connect'];
    handler();

    await new Promise((r) => setTimeout(r, 10));

    expect(mockStatsRefresh).toHaveBeenCalled();
  });
});
