import { defineStore } from 'pinia';

export interface LevelUpCelebration {
  id: string;
  kind: 'level_up';
  level: number;
}

export interface AchievementCelebration {
  id: string;
  kind: 'achievement';
  name: string;
  icon?: string;
}

export type CelebrationItem = LevelUpCelebration | AchievementCelebration;

export interface XpFloat {
  id: string;
  amount: number;
}

const FLOAT_CAP = 5;

interface CelebrationsState {
  queue: CelebrationItem[];
  floats: XpFloat[];
}

export const useCelebrationsStore = defineStore('celebrations', {
  state: (): CelebrationsState => ({
    queue: [],
    floats: [],
  }),

  getters: {
    current: (state): CelebrationItem | null => state.queue[0] ?? null,
  },

  actions: {
    enqueue(item: CelebrationItem): void {
      // De-dupe: skip if last item in queue is an identical consecutive level_up
      const last = this.queue[this.queue.length - 1];
      if (
        item.kind === 'level_up' &&
        last?.kind === 'level_up' &&
        (last as LevelUpCelebration).level === item.level
      ) {
        return;
      }
      this.queue.push(item);
    },

    dismiss(): void {
      this.queue.shift();
    },

    addFloat(amount: number): void {
      const id = `float-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      this.floats.push({ id, amount });

      // Enforce cap — drop oldest
      if (this.floats.length > FLOAT_CAP) {
        this.floats.shift();
      }
    },

    removeFloat(id: string): void {
      const idx = this.floats.findIndex((f) => f.id === id);
      if (idx !== -1) {
        this.floats.splice(idx, 1);
      }
    },
  },
});
