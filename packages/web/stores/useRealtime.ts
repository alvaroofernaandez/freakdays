import { defineStore } from 'pinia';
import type { Socket } from 'socket.io-client';
import { WIRE_EVENTS } from '@freakdays/domain';
import type { LevelUpPayload, AchievementUnlockedPayload } from '@freakdays/domain';

import { useAuthStore } from './auth';
import { useToast } from '../app/composables/useToast';
import { useStats } from '../app/composables/useStats';

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
        // Reconcile any missed events while offline
        useStats()
          .fetchStats()
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
        useToast().success(`Subiste al nivel ${p.newLevel}!`);
      };

      const onAchievementUnlocked = (payload: unknown) => {
        const p = payload as AchievementUnlockedPayload;
        if (typeof p?.name !== 'string') return;
        useToast().success(`Logro desbloqueado: ${p.name}`);
      };

      const onStatsUpdated = () => {
        useStats()
          .fetchStats()
          .catch(() => {
            // best-effort
          });
      };

      // Store listener refs for cleanup
      const listeners: Record<string, Listener> = {
        connect: onConnect as Listener,
        disconnect: onDisconnect as Listener,
        [WIRE_EVENTS.LEVEL_UP]: onLevelUp as Listener,
        [WIRE_EVENTS.ACHIEVEMENT_UNLOCKED]: onAchievementUnlocked as Listener,
        [WIRE_EVENTS.STATS_UPDATED]: onStatsUpdated as Listener,
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
