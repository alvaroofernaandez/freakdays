import { afterEach, describe, expect, it, vi } from 'vitest';

import { isSupabaseFallbackEnabled } from '../../../app/utils/migration-flags';

describe('migration-flags', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retorna false por defecto cuando no hay config', () => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      public: {
        enableSupabaseFallback: undefined,
      },
    }));

    expect(isSupabaseFallbackEnabled()).toBe(false);
  });

  it('retorna true cuando NUXT_PUBLIC_ENABLE_SUPABASE_FALLBACK=true', () => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      public: {
        enableSupabaseFallback: 'true',
      },
    }));

    expect(isSupabaseFallbackEnabled()).toBe(true);
  });

  it('retorna false cuando flag está en false', () => {
    vi.stubGlobal('useRuntimeConfig', () => ({
      public: {
        enableSupabaseFallback: 'false',
      },
    }));

    expect(isSupabaseFallbackEnabled()).toBe(false);
  });
});
