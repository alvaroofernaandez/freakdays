import { beforeEach, describe, expect, it, vi } from 'vitest';

import { assertLegacyFallbackEnabled, canUseLegacyFallback } from '../../../app/utils/legacy-guard';

let legacyFallbackEnabled = false;

vi.mock('../../../app/utils/migration-flags', () => ({
  isSupabaseFallbackEnabled: () => legacyFallbackEnabled,
}));

describe('legacy-guard', () => {
  beforeEach(() => {
    legacyFallbackEnabled = false;
  });

  it('canUseLegacyFallback retorna false cuando fallback está apagado', () => {
    expect(canUseLegacyFallback()).toBe(false);
  });

  it('canUseLegacyFallback retorna true cuando fallback está encendido', () => {
    legacyFallbackEnabled = true;
    expect(canUseLegacyFallback()).toBe(true);
  });

  it('assertLegacyFallbackEnabled lanza error claro cuando fallback está apagado', () => {
    expect(() => assertLegacyFallbackEnabled('calendar')).toThrow(
      'El dominio legacy "calendar" todavía no está migrado a freak-days-api.',
    );
  });

  it('assertLegacyFallbackEnabled no lanza cuando fallback está encendido', () => {
    legacyFallbackEnabled = true;
    expect(() => assertLegacyFallbackEnabled('calendar')).not.toThrow();
  });
});
