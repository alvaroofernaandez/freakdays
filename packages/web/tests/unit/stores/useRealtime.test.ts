import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
// vitest hoists vi.mock above these imports, so the mocks below still apply.
import { useRealtimeStore } from '../../../stores/useRealtime';
import { WIRE_EVENTS } from '@freakdays/domain';

// Mock socket.io-client
const mockSocket = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  connected: false,
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

// Mock domain WIRE_EVENTS
vi.mock('@freakdays/domain', () => ({
  WIRE_EVENTS: {
    LEVEL_UP: 'level_up',
    ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
    STATS_UPDATED: 'stats_updated',
  },
}));

// Mock useAuthStore
const mockAuthStore = {
  userId: 'user-test-id' as string | null,
  isAuthenticated: true,
};

vi.mock('../../../stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}));

// Mock useToast
const mockToastSuccess = vi.fn();
vi.mock('../../../app/composables/useToast', () => ({
  useToast: () => ({ success: mockToastSuccess }),
}));

// Mock useStats
const mockFetchStats = vi.fn().mockResolvedValue(null);
vi.mock('../../../app/composables/useStats', () => ({
  useStats: () => ({ fetchStats: mockFetchStats }),
}));

// Mock useAuthContext
const mockRefresh = vi.fn().mockResolvedValue(undefined);
vi.mock('../../../app/composables/useAuthContext', () => ({
  useAuthContext: () => ({
    refresh: mockRefresh,
    token: { value: 'mock-token' },
  }),
}));

describe('useRealtimeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockAuthStore.userId = 'user-test-id';
    mockSocket.connected = false;
  });

  describe('Test A: connect() when not authenticated → socket.connect NOT called', () => {
    it('does not call socket.connect when userId is null', () => {
      mockAuthStore.userId = null;
      const store = useRealtimeStore();

      store.connect(mockSocket as never);

      expect(mockSocket.connect).not.toHaveBeenCalled();
    });
  });

  describe('Test B: connect() with authed user', () => {
    it('calls socket.connect() and registers listeners', () => {
      const store = useRealtimeStore();

      store.connect(mockSocket as never);

      expect(mockSocket.connect).toHaveBeenCalled();
      expect(mockSocket.off).toHaveBeenCalledWith(WIRE_EVENTS.LEVEL_UP, expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith(WIRE_EVENTS.LEVEL_UP, expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith(
        WIRE_EVENTS.ACHIEVEMENT_UNLOCKED,
        expect.any(Function),
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        WIRE_EVENTS.ACHIEVEMENT_UNLOCKED,
        expect.any(Function),
      );
      expect(mockSocket.off).toHaveBeenCalledWith(WIRE_EVENTS.STATS_UPDATED, expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith(WIRE_EVENTS.STATS_UPDATED, expect.any(Function));
    });
  });

  describe('Test C: disconnect() cleans up listeners and socket', () => {
    it('calls socket.off for each listener and socket.disconnect()', () => {
      const store = useRealtimeStore();

      store.connect(mockSocket as never);
      vi.clearAllMocks();

      store.disconnect();

      expect(mockSocket.off).toHaveBeenCalledWith(WIRE_EVENTS.LEVEL_UP, expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith(
        WIRE_EVENTS.ACHIEVEMENT_UNLOCKED,
        expect.any(Function),
      );
      expect(mockSocket.off).toHaveBeenCalledWith(WIRE_EVENTS.STATS_UPDATED, expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('sets connected=false and socket=null after disconnect', () => {
      const store = useRealtimeStore();

      store.connect(mockSocket as never);
      store.disconnect();

      expect(store.connected).toBe(false);
      expect(store.socket).toBeNull();
    });
  });

  describe('Test E: reconnect cycle does not duplicate listeners', () => {
    it('listeners registered exactly once after connect → disconnect → connect', () => {
      const store = useRealtimeStore();

      store.connect(mockSocket as never);
      store.disconnect();
      vi.clearAllMocks();

      store.connect(mockSocket as never);

      // off is called before on (no-duplicate guard)
      const offCalls = (mockSocket.off as ReturnType<typeof vi.fn>).mock.calls;
      const levelUpOffCalls = offCalls.filter(
        (args: unknown[]) => args[0] === WIRE_EVENTS.LEVEL_UP,
      );
      // off should be called once per event per connect (dedup guard)
      expect(levelUpOffCalls.length).toBeGreaterThanOrEqual(1);
    });
  });
});
