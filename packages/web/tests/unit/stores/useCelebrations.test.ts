import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

describe('useCelebrationsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('(a) enqueue + current returns first item', async () => {
    const { useCelebrationsStore } = await import('../../../stores/useCelebrations');
    const store = useCelebrationsStore();

    store.enqueue({ id: '1', kind: 'level_up', level: 5 });

    expect(store.current).not.toBeNull();
    expect(store.current?.kind).toBe('level_up');
    expect((store.current as { level: number } | null)?.level).toBe(5);
  });

  it('(b) dismiss() shifts queue and advances to next', async () => {
    const { useCelebrationsStore } = await import('../../../stores/useCelebrations');
    const store = useCelebrationsStore();

    store.enqueue({ id: '1', kind: 'level_up', level: 3 });
    store.enqueue({ id: '2', kind: 'level_up', level: 4 });

    store.dismiss();

    expect(store.current?.kind).toBe('level_up');
    expect((store.current as { level: number } | null)?.level).toBe(4);
  });

  it('(c) two level_up events queue sequentially', async () => {
    const { useCelebrationsStore } = await import('../../../stores/useCelebrations');
    const store = useCelebrationsStore();

    store.enqueue({ id: '1', kind: 'level_up', level: 2 });
    store.enqueue({ id: '2', kind: 'level_up', level: 3 });

    // First shown immediately
    expect((store.current as { level: number } | null)?.level).toBe(2);
    expect(store.queue.length).toBe(2);

    store.dismiss();

    // Second shown after dismiss
    expect((store.current as { level: number } | null)?.level).toBe(3);
  });

  it('(d) de-dupe consecutive identical level_up (same level)', async () => {
    const { useCelebrationsStore } = await import('../../../stores/useCelebrations');
    const store = useCelebrationsStore();

    store.enqueue({ id: '1', kind: 'level_up', level: 5 });
    store.enqueue({ id: '2', kind: 'level_up', level: 5 }); // duplicate

    // Only one in queue
    expect(store.queue.length).toBe(1);
  });

  it('(e) addFloat enforces cap (oldest dropped at 6th item)', async () => {
    const { useCelebrationsStore } = await import('../../../stores/useCelebrations');
    const store = useCelebrationsStore();

    for (let i = 1; i <= 6; i++) {
      store.addFloat(i * 10);
    }

    // Cap is 5 — oldest (10) dropped, newest (60) at end
    expect(store.floats.length).toBe(5);
    expect(store.floats.some((f) => f.amount === 10)).toBe(false);
    expect(store.floats.some((f) => f.amount === 60)).toBe(true);
  });

  it('(f) removeFloat removes by id', async () => {
    const { useCelebrationsStore } = await import('../../../stores/useCelebrations');
    const store = useCelebrationsStore();

    store.addFloat(50);
    const floatId = store.floats[0]!.id;

    store.removeFloat(floatId);

    expect(store.floats.length).toBe(0);
  });

  it('(g) float lane independent of modal lane', async () => {
    const { useCelebrationsStore } = await import('../../../stores/useCelebrations');
    const store = useCelebrationsStore();

    store.enqueue({ id: '1', kind: 'level_up', level: 7 });
    store.addFloat(100);

    expect(store.current?.kind).toBe('level_up');
    expect(store.floats.length).toBe(1);

    store.dismiss();

    expect(store.current).toBeNull();
    expect(store.floats.length).toBe(1); // floats unaffected by dismiss
  });
});
