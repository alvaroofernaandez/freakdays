/**
 * Thin wrapper around `useSupabaseClient` from `@nuxtjs/supabase`.
 *
 * Restored as a minimal stub to unbreak `nuxt build` on `main`. The original
 * file was missing; PartyAnimeList.vue and TierListEditor.vue imported it.
 *
 * Scheduled for removal in sub-phase S4 of the supabase→clerk migration
 * (see docs/migrations/supabase-to-clerk-nestjs.md). Call sites should
 * migrate to obtaining the Clerk JWT instead of the Supabase session token.
 */
export function useSupabase() {
  return useSupabaseClient();
}
