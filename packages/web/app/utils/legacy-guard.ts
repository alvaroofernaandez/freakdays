import { isSupabaseFallbackEnabled } from '@/utils/migration-flags';

function buildLegacyCutoverMessage(feature: string): string {
  return `El dominio legacy \"${feature}\" todavía no está migrado a freak-days-api. Activá NUXT_PUBLIC_ENABLE_SUPABASE_FALLBACK=true temporalmente o completá la migración del dominio.`;
}

export function canUseLegacyFallback(): boolean {
  return isSupabaseFallbackEnabled();
}

export function assertLegacyFallbackEnabled(feature: string): void {
  if (canUseLegacyFallback()) {
    return;
  }

  throw new Error(buildLegacyCutoverMessage(feature));
}
