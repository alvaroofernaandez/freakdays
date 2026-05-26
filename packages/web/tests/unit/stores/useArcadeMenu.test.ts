import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

describe('useArcadeMenuStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('(a) open() sets isOpen=true', async () => {
    const { useArcadeMenuStore } = await import('../../../stores/useArcadeMenu');
    const store = useArcadeMenuStore();

    store.open();

    expect(store.isOpen).toBe(true);
  });

  it('(b) close() sets isOpen=false', async () => {
    const { useArcadeMenuStore } = await import('../../../stores/useArcadeMenu');
    const store = useArcadeMenuStore();

    store.open();
    store.close();

    expect(store.isOpen).toBe(false);
  });

  it('(c) toggle() flips state', async () => {
    const { useArcadeMenuStore } = await import('../../../stores/useArcadeMenu');
    const store = useArcadeMenuStore();

    expect(store.isOpen).toBe(false);

    store.toggle();
    expect(store.isOpen).toBe(true);

    store.toggle();
    expect(store.isOpen).toBe(false);
  });

  it('(d) open(el) stores triggerEl', async () => {
    const { useArcadeMenuStore } = await import('../../../stores/useArcadeMenu');
    const store = useArcadeMenuStore();

    const el = document.createElement('button');
    store.open(el);

    expect(store.triggerEl).toBe(el);
  });

  it('close() sets triggerEl to null', async () => {
    const { useArcadeMenuStore } = await import('../../../stores/useArcadeMenu');
    const store = useArcadeMenuStore();

    const el = document.createElement('button');
    store.open(el);
    store.close();

    expect(store.triggerEl).toBeNull();
  });
});
