import { defineStore } from 'pinia';
import type { Socket } from 'socket.io-client';
import { WIRE_EVENTS } from '@freakdays/domain';
import type {
  LevelUpPayload,
  AchievementUnlockedPayload,
  FeedEntryAddedPayload,
} from '@freakdays/domain';

import { useAuthStore } from './auth';
import { useCelebrationsStore } from './useCelebrations';
import { useFeedStore } from './useFeed';
import { useSoundStore } from './useSound';
import { useStatsStore } from './useStatsStore';

interface RealtimeState {
  connected: boolean;
  socket: Socket | null;
}

type Listener = (...args: unknown[]) => void;

export const useRealtimeStore = defineStore('realtime', {
  state: (): RealtimeState => ({
    connected: false,
    socket: null,
  }),

  actions: {
    connect(socket: Socket) {
      const authStore = useAuthStore();

      if (!authStore.userId) {
        return;
      }

      this.socket = socket;

      const onConnect = () => {
        this.connected = true;
        // Seed stats store on connect (delta = 0 on first load)
        useStatsStore()
          .refresh()
          .catch(() => {
            // best-effort
          });
      };

      const onDisconnect = () => {
        this.connected = false;
      };

      const onLevelUp = (payload: unknown) => {
        const p = payload as LevelUpPayload;
        if (typeof p?.newLevel !== 'number') return;

        const id = `level-up-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        useCelebrationsStore().enqueue({ id, kind: 'level_up', level: p.newLevel });
        useSoundStore().playLevelUp();
      };

      const onAchievementUnlocked = (payload: unknown) => {
        const p = payload as AchievementUnlockedPayload;
        if (typeof p?.name !== 'string') return;

        const id = `achievement-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        useCelebrationsStore().enqueue({ id, kind: 'achievement', name: p.name });
        useSoundStore().playAchievement();
      };

      const onStatsUpdated = () => {
        useStatsStore()
          .refresh()
          .then((delta) => {
            if (delta > 0) {
              useCelebrationsStore().addFloat(delta);
              useSoundStore().playXp();
            }
          })
          .catch(() => {
            // best-effort
          });
      };

      const onFeedEntryAdded = (payload: unknown) => {
        const p = payload as FeedEntryAddedPayload;
        if (typeof p?.id !== 'string') return;
        useFeedStore().prepend(p);
      };

      // Store listener refs for cleanup
      const listeners: Record<string, Listener> = {
        connect: onConnect as Listener,
        disconnect: onDisconnect as Listener,
        [WIRE_EVENTS.LEVEL_UP]: onLevelUp as Listener,
        [WIRE_EVENTS.ACHIEVEMENT_UNLOCKED]: onAchievementUnlocked as Listener,
        [WIRE_EVENTS.STATS_UPDATED]: onStatsUpdated as Listener,
        [WIRE_EVENTS.FEED_ENTRY_ADDED]: onFeedEntryAdded as Listener,
      };

      (socket as unknown as { _realtimeListeners?: Record<string, Listener> })._realtimeListeners =
        listeners;

      // De-duplicate: remove before re-adding (reconnect safety)
      for (const [event, handler] of Object.entries(listeners)) {
        socket.off(event, handler);
        socket.on(event, handler);
      }

      socket.connect();
    },

    disconnect() {
      const socket = this.socket;

      if (!socket) return;

      const listeners = (socket as unknown as { _realtimeListeners?: Record<string, Listener> })
        ._realtimeListeners;

      if (listeners) {
        for (const [event, handler] of Object.entries(listeners)) {
          socket.off(event, handler);
        }
        delete (socket as unknown as { _realtimeListeners?: Record<string, Listener> })
          ._realtimeListeners;
      }

      socket.disconnect();
      this.socket = null;
      this.connected = false;
    },
  },
});
