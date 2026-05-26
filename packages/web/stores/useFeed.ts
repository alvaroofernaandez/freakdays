import { defineStore } from 'pinia';
import type { FeedEntryAddedPayload } from '@freakdays/domain';

import { useApiClient } from '../app/composables/useApiClient';

export type FeedEntry = FeedEntryAddedPayload;

interface FeedState {
  items: FeedEntry[];
  nextCursor: string | undefined;
  loading: boolean;
}

interface FeedPage {
  items: FeedEntry[];
  nextCursor?: string;
}

export const useFeedStore = defineStore('feed', {
  state: (): FeedState => ({
    items: [],
    nextCursor: undefined,
    loading: false,
  }),

  actions: {
    async fetchFeed(partyId: string): Promise<void> {
      this.loading = true;

      try {
        const { get } = useApiClient();
        const data = await get<FeedPage>(`/v1/parties/${partyId}/feed`);
        this.items = data.items;
        this.nextCursor = data.nextCursor;
      } finally {
        this.loading = false;
      }
    },

    async fetchMore(partyId: string): Promise<void> {
      if (!this.nextCursor) return;

      this.loading = true;

      try {
        const { get } = useApiClient();
        const data = await get<FeedPage>(`/v1/parties/${partyId}/feed`, {
          query: { cursor: this.nextCursor },
        });
        this.items = [...this.items, ...data.items];
        this.nextCursor = data.nextCursor;
      } finally {
        this.loading = false;
      }
    },

    prepend(entry: FeedEntry): void {
      this.items = [entry, ...this.items];
    },
  },
});
