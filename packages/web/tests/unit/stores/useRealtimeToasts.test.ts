import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
// vitest hoists vi.mock above these imports, so the mocks below still apply.
import { useRealtimeStore } from '../../../stores/useRealtime';
import { WIRE_EVENTS } from '@freakdays/domain';

// We simulate socket events by capturing the registered listener and calling it directly.
// Listener registry: event name → handler
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
  _realtimeListeners: {} as Record<string, (...args: unknown[]) => void>,
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

const mockAuthStore = {
  userId: 'user-test-id' as string | null,
  isAuthenticated: true,
};

vi.mock('../../../stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}));

// Toast is no longer called for level_up/achievement — replaced by celebrations
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

// Stats store mock
const mockStatsRefresh = vi.fn().mockResolvedValue(0);
vi.mock('../../../stores/useStatsStore', () => ({
  useStatsStore: () => ({
    refresh: mockStatsRefresh,
  }),
}));

const mockFetchStats = vi.fn().mockResolvedValue(null);
vi.mock('../../../app/composables/useStats', () => ({
  useStats: () => ({ fetchStats: mockFetchStats }),
}));

describe('useRealtimeStore — celebrations + sound (rewired, no toasts)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    // Reset the listener registry
    for (const key of Object.keys(listenerRegistry)) {
      Reflect.deleteProperty(listenerRegistry, key);
    }
    mockAuthStore.userId = 'user-test-id';
    mockStatsRefresh.mockResolvedValue(0);
  });

  const connectStore = () => {
    const store = useRealtimeStore();
    store.connect(mockSocket as never);
    return store;
  };

  describe('Test A: level_up event enqueues celebration (NOT toast)', () => {
    it('calls useCelebrationsStore().enqueue with kind=level_up and correct level', () => {
      connectStore();

      const handler = listenerRegistry[WIRE_EVENTS.LEVEL_UP];
      expect(handler).toBeDefined();

      handler({ previousLevel: 2, newLevel: 3, totalExp: 450 });

      expect(mockEnqueue).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'level_up', level: 3 }),
      );
      expect(mockPlayLevelUp).toHaveBeenCalled();
      expect(mockToastSuccess).not.toHaveBeenCalled();
    });
  });

  describe('Test B: achievement_unlocked event enqueues celebration (NOT toast)', () => {
    it('calls useCelebrationsStore().enqueue with kind=achievement and correct name', () => {
      connectStore();

      const handler = listenerRegistry[WIRE_EVENTS.ACHIEVEMENT_UNLOCKED];
      expect(handler).toBeDefined();

      handler({ code: 'FIRST_GOAL', name: 'First Goal', description: 'Complete your first quest' });

      expect(mockEnqueue).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'achievement', name: 'First Goal' }),
      );
      expect(mockPlayAchievement).toHaveBeenCalled();
      expect(mockToastSuccess).not.toHaveBeenCalled();
    });
  });

  describe('Test C: stats_updated triggers statsStore.refresh(), no toast', () => {
    it('calls statsStore.refresh() without calling toast', async () => {
      connectStore();

      const handler = listenerRegistry[WIRE_EVENTS.STATS_UPDATED];
      expect(handler).toBeDefined();

      handler({});

      await new Promise((r) => setTimeout(r, 10));

      expect(mockStatsRefresh).toHaveBeenCalled();
      expect(mockToastSuccess).not.toHaveBeenCalled();
    });
  });

  describe('Test D: level_up with missing newLevel → no celebration', () => {
    it('does not enqueue when newLevel is missing', () => {
      connectStore();

      const handler = listenerRegistry[WIRE_EVENTS.LEVEL_UP];
      handler({ previousLevel: 2 }); // missing newLevel

      expect(mockEnqueue).not.toHaveBeenCalled();
    });
  });

  describe('Test E: achievement_unlocked with missing name → no celebration', () => {
    it('does not enqueue when name is missing', () => {
      connectStore();

      const handler = listenerRegistry[WIRE_EVENTS.ACHIEVEMENT_UNLOCKED];
      handler({ code: 'FIRST_GOAL' }); // missing name

      expect(mockEnqueue).not.toHaveBeenCalled();
    });
  });
});
