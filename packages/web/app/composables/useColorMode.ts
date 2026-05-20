import { computed, onBeforeUnmount, ref, watch } from 'vue';

type ColorMode = 'light' | 'dark' | 'system';
type EffectiveMode = 'light' | 'dark';

const STORAGE_KEY = 'freakdays-theme';

const mode = ref<ColorMode>('dark');

function getSystemPreference(): EffectiveMode {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyMode(effective: EffectiveMode) {
  if (typeof document === 'undefined') return;
  if (effective === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function useColorMode() {
  const effectiveMode = computed<EffectiveMode>(() => {
    if (mode.value === 'system') return getSystemPreference();
    return mode.value;
  });

  watch(
    effectiveMode,
    (val) => {
      applyMode(val);
    },
    { immediate: true },
  );

  let mediaListener: ((e: MediaQueryListEvent) => void) | null = null;

  watch(
    mode,
    (val) => {
      if (typeof window === 'undefined') return;

      const mq = window.matchMedia('(prefers-color-scheme: dark)');

      if (mediaListener) {
        mq.removeEventListener('change', mediaListener);
        mediaListener = null;
      }

      if (val === 'system') {
        mediaListener = () => {
          applyMode(getSystemPreference());
        };
        mq.addEventListener('change', mediaListener);
      }

      try {
        localStorage.setItem(STORAGE_KEY, val);
      } catch {
        // storage unavailable
      }
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    if (typeof window !== 'undefined' && mediaListener) {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', mediaListener);
    }
  });

  function setMode(newMode: ColorMode) {
    mode.value = newMode;
  }

  function init() {
    if (typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ColorMode | null;
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        mode.value = stored;
      }
    } catch {
      // storage unavailable
    }
  }

  return {
    mode,
    effectiveMode,
    setMode,
    init,
  };
}
