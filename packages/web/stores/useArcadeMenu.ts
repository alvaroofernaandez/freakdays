import { defineStore } from 'pinia';

interface ArcadeMenuState {
  isOpen: boolean;
  triggerEl: HTMLElement | null;
}

export const useArcadeMenuStore = defineStore('arcadeMenu', {
  state: (): ArcadeMenuState => ({
    isOpen: false,
    triggerEl: null,
  }),

  actions: {
    open(trigger?: HTMLElement | null): void {
      this.isOpen = true;
      if (trigger) {
        this.triggerEl = trigger;
      }
    },

    close(): void {
      this.isOpen = false;
      this.triggerEl = null;
    },

    toggle(trigger?: HTMLElement | null): void {
      if (this.isOpen) {
        this.close();
      } else {
        this.open(trigger);
      }
    },
  },
});
