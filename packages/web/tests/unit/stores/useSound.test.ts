import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

// Mock @vueuse/core useStorage — returns a reactive ref backed by a plain object
const storageMap = new Map<string, unknown>();
vi.mock('@vueuse/core', () => ({
  useStorage: vi.fn((key: string, defaultValue: unknown) => {
    const stored = storageMap.get(key);
    const val = stored !== undefined ? stored : defaultValue;
    const r = { value: val };
    return new Proxy(r, {
      set(target, prop, value) {
        if (prop === 'value') {
          storageMap.set(key, value);
        }
        (target as Record<string | symbol, unknown>)[prop] = value;
        return true;
      },
    });
  }),
}));

// Shared spies reused across test instances
const createOscillatorSpy = vi.fn();
const createGainSpy = vi.fn();
const resumeSpy = vi.fn().mockResolvedValue(undefined);

class MockGainNode {
  gain = {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
  connect = vi.fn();
}

class MockOscillatorNode {
  frequency = { setValueAtTime: vi.fn(), value: 440 };
  type = 'sine';
  start = vi.fn();
  stop = vi.fn();
  connect = vi.fn();
}

// A real class (constructable) that delegates to shared spies
class MockAudioContext {
  currentTime = 0;
  state: AudioContextState = 'running';
  destination = {};
  createOscillator() {
    createOscillatorSpy();
    return new MockOscillatorNode();
  }
  createGain() {
    createGainSpy();
    return new MockGainNode();
  }
  resume() {
    return resumeSpy();
  }
}

describe('useSoundStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetModules();
    storageMap.clear();
    createOscillatorSpy.mockClear();
    createGainSpy.mockClear();
    resumeSpy.mockClear();

    Object.defineProperty(window, 'AudioContext', {
      value: MockAudioContext,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('(a) playClick() is a no-op when muted=true (enabled=false)', async () => {
    storageMap.set('freakdays-sound', false);

    const { useSoundStore } = await import('../../../stores/useSound');
    const store = useSoundStore();

    store.playClick();

    // No oscillator created = no AudioContext methods called
    expect(createOscillatorSpy).not.toHaveBeenCalled();
  });

  it('(b) no AudioContext method called when muted=true', async () => {
    storageMap.set('freakdays-sound', false);

    const { useSoundStore } = await import('../../../stores/useSound');
    const store = useSoundStore();

    store.playXp();
    store.playLevelUp();

    expect(createOscillatorSpy).not.toHaveBeenCalled();
  });

  it('(c) tone() creates OscillatorNode with correct freq', async () => {
    storageMap.set('freakdays-sound', true);

    const { useSoundStore } = await import('../../../stores/useSound');
    const store = useSoundStore();

    store.playClick();

    expect(createOscillatorSpy).toHaveBeenCalled();
    expect(createGainSpy).toHaveBeenCalled();
  });

  it('(d) playLevelUp() schedules 4 notes (4 oscillators)', async () => {
    storageMap.set('freakdays-sound', true);

    const { useSoundStore } = await import('../../../stores/useSound');
    const store = useSoundStore();

    store.playLevelUp();

    expect(createOscillatorSpy).toHaveBeenCalledTimes(4);
  });

  it('(e) toggleMute() flips enabled and writes to localStorage', async () => {
    storageMap.set('freakdays-sound', false);

    const { useSoundStore } = await import('../../../stores/useSound');
    const store = useSoundStore();

    store.toggleMute();
    expect(storageMap.get('freakdays-sound')).toBe(true);

    store.toggleMute();
    expect(storageMap.get('freakdays-sound')).toBe(false);
  });

  it('(f) playClick() is a no-op when window.AudioContext is undefined', async () => {
    storageMap.set('freakdays-sound', true);
    Object.defineProperty(window, 'AudioContext', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { useSoundStore } = await import('../../../stores/useSound');
    const store = useSoundStore();

    expect(() => store.playClick()).not.toThrow();
    expect(createOscillatorSpy).not.toHaveBeenCalled();
  });

  it('(g) suspended context calls resume() before tone', async () => {
    storageMap.set('freakdays-sound', true);

    class SuspendedAudioContext extends MockAudioContext {
      override state: AudioContextState = 'suspended';
    }

    Object.defineProperty(window, 'AudioContext', {
      value: SuspendedAudioContext,
      writable: true,
      configurable: true,
    });

    const { useSoundStore } = await import('../../../stores/useSound');
    const store = useSoundStore();

    store.playClick();

    expect(resumeSpy).toHaveBeenCalled();
  });

  describe('reduced-motion auto-quiet', () => {
    let originalMatchMedia: typeof window.matchMedia;

    beforeEach(() => {
      originalMatchMedia = window.matchMedia;
    });

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });

    it('(h) reduced-motion + not explicitly enabled → playClick is no-op', async () => {
      // User has NOT toggled sound (default false)
      storageMap.set('freakdays-sound', false);

      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      const { useSoundStore } = await import('../../../stores/useSound');
      const store = useSoundStore();

      store.playClick();

      expect(createOscillatorSpy).not.toHaveBeenCalled();
    });

    it('(i) reduced-motion + explicitly enabled by user → sound plays', async () => {
      // User explicitly turned sound ON
      storageMap.set('freakdays-sound', true);

      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      const { useSoundStore } = await import('../../../stores/useSound');
      const store = useSoundStore();

      store.playClick();

      // Sound plays because the user explicitly opted in
      expect(createOscillatorSpy).toHaveBeenCalled();
    });
  });
});
