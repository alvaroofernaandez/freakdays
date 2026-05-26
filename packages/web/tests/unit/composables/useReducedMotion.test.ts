import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We test the composable behavior by importing it after setting up the window mock
let useReducedMotion: typeof import('../../../app/composables/useReducedMotion').useReducedMotion;

describe('useReducedMotion', () => {
  let originalMatchMedia: typeof window.matchMedia;
  let mockMediaQueryList: {
    matches: boolean;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    originalMatchMedia = window.matchMedia;
    mockMediaQueryList = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    vi.resetModules();
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
  });

  it('returns false when matchMedia does not match (no reduced motion preference)', async () => {
    mockMediaQueryList.matches = false;
    window.matchMedia = vi.fn().mockReturnValue(mockMediaQueryList);

    const mod = await import('../../../app/composables/useReducedMotion');
    useReducedMotion = mod.useReducedMotion;

    const { prefersReduced } = useReducedMotion();
    expect(prefersReduced.value).toBe(false);
  });

  it('returns true when matchMedia matches prefers-reduced-motion: reduce', async () => {
    mockMediaQueryList.matches = true;
    window.matchMedia = vi.fn().mockReturnValue(mockMediaQueryList);

    const mod = await import('../../../app/composables/useReducedMotion');
    useReducedMotion = mod.useReducedMotion;

    const { prefersReduced } = useReducedMotion();
    expect(prefersReduced.value).toBe(true);
  });

  it('queries correct media string', async () => {
    const mockMatchMedia = vi.fn().mockReturnValue(mockMediaQueryList);
    window.matchMedia = mockMatchMedia;

    const mod = await import('../../../app/composables/useReducedMotion');
    useReducedMotion = mod.useReducedMotion;

    useReducedMotion();
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });
});
