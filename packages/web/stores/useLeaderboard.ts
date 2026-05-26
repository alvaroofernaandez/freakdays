import { defineStore } from 'pinia';

import { useApiClient } from '../app/composables/useApiClient';

export interface LeaderboardRow {
  readonly rank: number;
  readonly userId: string;
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
  readonly totalExp: number;
  readonly level: number;
  readonly currentStreak: number;
  readonly isCurrentUser: boolean;
}

interface LeaderboardPage {
  items: LeaderboardRow[];
  yourRank: number | null;
  total: number;
  page: number;
}

interface LeaderboardState {
  partyRows: LeaderboardRow[];
  globalRows: LeaderboardRow[];
  yourRank: number | null;
  total: number;
  page: number;
  loading: boolean;
}

export const useLeaderboardStore = defineStore('leaderboard', {
  state: (): LeaderboardState => ({
    partyRows: [],
    globalRows: [],
    yourRank: null,
    total: 0,
    page: 1,
    loading: false,
  }),

  getters: {
    currentUserRow: (state): LeaderboardRow | undefined =>
      state.partyRows.find((r) => r.isCurrentUser) ?? state.globalRows.find((r) => r.isCurrentUser),
  },

  actions: {
    async fetchPartyLeaderboard(partyId: string, page = 1, limit = 50): Promise<void> {
      this.loading = true;

      try {
        const { get } = useApiClient();
        const data = await get<LeaderboardPage>(`/v1/parties/${partyId}/leaderboard`, {
          query: { page, limit },
        });
        this.partyRows = data.items;
        this.yourRank = data.yourRank;
        this.total = data.total;
        this.page = data.page;
      } finally {
        this.loading = false;
      }
    },

    async fetchGlobal(page = 1, limit = 50): Promise<void> {
      this.loading = true;

      try {
        const { get } = useApiClient();
        const data = await get<LeaderboardPage>('/v1/leaderboard/global', {
          query: { page, limit },
        });
        this.globalRows = data.items;
        this.yourRank = data.yourRank;
        this.total = data.total;
        this.page = data.page;
      } finally {
        this.loading = false;
      }
    },

    async nextPage(context: 'party' | 'global', partyId?: string): Promise<void> {
      const next = this.page + 1;
      if (context === 'party' && partyId) {
        await this.fetchPartyLeaderboard(partyId, next);
      } else if (context === 'global') {
        await this.fetchGlobal(next);
      }
    },

    async prevPage(context: 'party' | 'global', partyId?: string): Promise<void> {
      if (this.page <= 1) return;
      const prev = this.page - 1;
      if (context === 'party' && partyId) {
        await this.fetchPartyLeaderboard(partyId, prev);
      } else if (context === 'global') {
        await this.fetchGlobal(prev);
      }
    },
  },
});
