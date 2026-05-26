import { ref, onMounted, onUnmounted } from 'vue';

export function useReducedMotion() {
  const prefersReduced = ref(false);

  let mediaQuery: MediaQueryList | null = null;

  function handleChange(event: MediaQueryListEvent) {
    prefersReduced.value = event.matches;
  }

  if (import.meta.client) {
    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReduced.value = mediaQuery.matches;

    onMounted(() => {
      mediaQuery?.addEventListener('change', handleChange);
    });

    onUnmounted(() => {
      mediaQuery?.removeEventListener('change', handleChange);
    });
  }

  return {
    prefersReduced,
  };
}
