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

const mockToastSuccess = vi.fn();
vi.mock('../../../app/composables/useToast', () => ({
  useToast: () => ({ success: mockToastSuccess }),
}));

const mockFetchStats = vi.fn().mockResolvedValue(null);
vi.mock('../../../app/composables/useStats', () => ({
  useStats: () => ({ fetchStats: mockFetchStats }),
}));

vi.mock('../../../app/composables/useAuthContext', () => ({
  useAuthContext: () => ({
    refresh: vi.fn().mockResolvedValue(undefined),
    token: { value: 'mock-token' },
  }),
}));

describe('useRealtimeStore — toasts + stats refetch (SLICE 6)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    // Reset the listener registry
    for (const key of Object.keys(listenerRegistry)) {
      Reflect.deleteProperty(listenerRegistry, key);
    }
    mockAuthStore.userId = 'user-test-id';
  });

  const connectStore = () => {
    const store = useRealtimeStore();
    store.connect(mockSocket as never);
    return store;
  };

  describe('Test A: level_up event shows toast with newLevel', () => {
    it('calls useToast().success with a string containing the newLevel', () => {
      connectStore();

      const handler = listenerRegistry[WIRE_EVENTS.LEVEL_UP];
      expect(handler).toBeDefined();

      handler({ previousLevel: 2, newLevel: 3, totalExp: 450 });

      expect(mockToastSuccess).toHaveBeenCalledTimes(1);
      expect((mockToastSuccess.mock.calls[0] as string[])[0]).toContain('3');
    });
  });

  describe('Test B: achievement_unlocked event shows toast with name', () => {
    it('calls useToast().success with a string containing the achievement name', () => {
      connectStore();

      const handler = listenerRegistry[WIRE_EVENTS.ACHIEVEMENT_UNLOCKED];
      expect(handler).toBeDefined();

      handler({ code: 'FIRST_GOAL', name: 'First Goal', description: 'Complete your first quest' });

      expect(mockToastSuccess).toHaveBeenCalledTimes(1);
      expect((mockToastSuccess.mock.calls[0] as string[])[0]).toContain('First Goal');
    });
  });

  describe('Test C: stats_updated triggers fetchStats, no toast', () => {
    it('calls useStats().fetchStats() without calling toast', () => {
      connectStore();

      const handler = listenerRegistry[WIRE_EVENTS.STATS_UPDATED];
      expect(handler).toBeDefined();

      handler({});

      expect(mockFetchStats).toHaveBeenCalled();
      expect(mockToastSuccess).not.toHaveBeenCalled();
    });
  });

  describe('Test D: level_up with missing newLevel → no toast', () => {
    it('does not call toast when newLevel is missing', () => {
      connectStore();

      const handler = listenerRegistry[WIRE_EVENTS.LEVEL_UP];
      handler({ previousLevel: 2 }); // missing newLevel

      expect(mockToastSuccess).not.toHaveBeenCalled();
    });
  });

  describe('Test E: achievement_unlocked with missing name → no toast', () => {
    it('does not call toast when name is missing', () => {
      connectStore();

      const handler = listenerRegistry[WIRE_EVENTS.ACHIEVEMENT_UNLOCKED];
      handler({ code: 'FIRST_GOAL' }); // missing name

      expect(mockToastSuccess).not.toHaveBeenCalled();
    });
  });
});
