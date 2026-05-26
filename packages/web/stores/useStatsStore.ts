import { defineStore } from 'pinia';
import { useStats } from '../app/composables/useStats';
import { useProfile } from '../app/composables/useProfile';
import type { UserStats } from '../app/composables/useStats';

interface StatsState {
  stats: UserStats | null;
}

export const useStatsStore = defineStore('stats', {
  state: (): StatsState => ({
    stats: null,
  }),

  getters: {
    totalExp: (state): number => state.stats?.totalExp ?? 0,

    level: (state): number => state.stats?.level ?? 1,

    expProgress: (state): { current: number; needed: number; progress: number } | null => {
      if (!state.stats) return null;
      return useProfile().expForNextLevel(state.stats.totalExp);
    },
  },

  actions: {
    /**
     * Fetches latest stats and returns the EXP delta (next - prev).
     * Returns 0 on first load, null fetch, or no change.
     */
    async refresh(): Promise<number> {
      let next: UserStats | null = null;

      try {
        next = await useStats().fetchStats();
      } catch {
        // best-effort — keep existing stats, return 0 delta
        return 0;
      }

      if (!next) return 0;

      // On first load, prev is seeded to next so delta = 0 (no spurious float)
      const prevExp = this.stats?.totalExp ?? next.totalExp;
      const delta = next.totalExp - prevExp;

      this.stats = next;
      return delta;
    },
  },
});
