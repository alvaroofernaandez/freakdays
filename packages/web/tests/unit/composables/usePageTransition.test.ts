import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { usePageTransition } from '../../../app/composables/usePageTransition';

// Mock gsap at the top level so vi.mock hoisting catches it before any import
const mockGsapTo = vi.fn((_el: unknown, opts: { onComplete?: () => void }) => {
  opts?.onComplete?.();
  return {};
});

vi.mock('gsap', () => ({
  default: {
    to: mockGsapTo,
  },
}));

describe('usePageTransition', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  describe('onLeave hook', () => {
    it('calls done() immediately when prefers-reduced-motion is active', () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      const { arcadeTransition } = usePageTransition();
      const done = vi.fn();
      const el = document.createElement('div');

      arcadeTransition.onLeave(el, done);

      expect(done).toHaveBeenCalled();
      expect(mockGsapTo).not.toHaveBeenCalled();
    });

    it('calls gsap.to when no reduced motion preference', async () => {
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      const { arcadeTransition } = usePageTransition();
      const done = vi.fn();
      const el = document.createElement('div');

      arcadeTransition.onLeave(el, done);

      // Wait for async import('gsap') microtask
      await new Promise((r) => setTimeout(r, 0));

      expect(mockGsapTo).toHaveBeenCalled();
    });
  });

  describe('onEnter hook', () => {
    it('calls done() immediately when prefers-reduced-motion is active', () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      const { arcadeTransition } = usePageTransition();
      const done = vi.fn();
      const el = document.createElement('div');

      arcadeTransition.onEnter(el, done);

      expect(done).toHaveBeenCalled();
      expect(mockGsapTo).not.toHaveBeenCalled();
    });

    it('calls gsap.to when no reduced motion preference', async () => {
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      const { arcadeTransition } = usePageTransition();
      const done = vi.fn();
      const el = document.createElement('div');

      arcadeTransition.onEnter(el, done);

      // Wait for async import('gsap') microtask
      await new Promise((r) => setTimeout(r, 0));

      expect(mockGsapTo).toHaveBeenCalled();
    });
  });

  describe('failure path — rejected gsap import', () => {
    it('onLeave: rejected import still calls done()', async () => {
      // Override the module mock to reject for this test
      vi.doMock('gsap', () => {
        throw new Error('chunk load failure');
      });

      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      // Re-import after overriding the mock so the new mock is picked up
      const { usePageTransition: usePageTransitionFresh } =
        await import('../../../app/composables/usePageTransition');

      const { arcadeTransition } = usePageTransitionFresh();
      const done = vi.fn();
      const el = document.createElement('div');

      arcadeTransition.onLeave(el, done);

      // Wait for promise rejection to propagate
      await new Promise((r) => setTimeout(r, 10));

      expect(done).toHaveBeenCalled();

      vi.doUnmock('gsap');
    });

    it('onEnter: rejected import still calls done()', async () => {
      vi.doMock('gsap', () => {
        throw new Error('chunk load failure');
      });

      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      const { usePageTransition: usePageTransitionFresh } =
        await import('../../../app/composables/usePageTransition');

      const { arcadeTransition } = usePageTransitionFresh();
      const done = vi.fn();
      const el = document.createElement('div');

      arcadeTransition.onEnter(el, done);

      await new Promise((r) => setTimeout(r, 10));

      expect(done).toHaveBeenCalled();

      vi.doUnmock('gsap');
    });
  });
});
