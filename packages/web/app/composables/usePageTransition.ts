// Client-only composable. On the server `import.meta.client` is false and all
// hooks fall through to immediate done() — no GSAP import executed server-side.

export interface TransitionHooks {
  onLeave: (el: Element, done: () => void) => void;
  onEnter: (el: Element, done: () => void) => void;
}

function prefersReducedMotion(): boolean {
  if (!import.meta.client) return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function usePageTransition() {
  const arcadeTransition: TransitionHooks = {
    onLeave(el: Element, done: () => void) {
      if (!import.meta.client || prefersReducedMotion()) {
        (el as HTMLElement).style.opacity = '0';
        done();
        return;
      }

      // Lazy import keeps GSAP out of server bundle. The cast is needed because
      // the vitest mock shape differs from the compiled GSAP types.
      void import('gsap')
        .then((mod) => {
          const gsap = (mod as unknown as { default: { to: typeof import('gsap').gsap.to } })
            .default;
          gsap.to(el, {
            opacity: 0,
            y: -8,
            duration: 0.18,
            ease: 'power2.in',
            onComplete: done,
          });
        })
        .catch(() => done());
    },

    onEnter(el: Element, done: () => void) {
      if (!import.meta.client || prefersReducedMotion()) {
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.transform = '';
        done();
        return;
      }

      void import('gsap')
        .then((mod) => {
          const gsap = (mod as unknown as { default: { to: typeof import('gsap').gsap.to } })
            .default;
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.22,
            ease: 'power2.out',
            onComplete: done,
          });
        })
        .catch(() => done());
    },
  };

  return { arcadeTransition };
}
