import { defineStore } from 'pinia';

/**
 * Minimal session shape kept for backward compatibility with components that
 * still read `authStore.session?.user?.id / .email`. Replaces the previous
 * `Session` import from `@supabase/supabase-js` (Supabase was removed in S8.2
 * of the migration; see docs/migrations/supabase-to-clerk-nestjs.md).
 *
 * Live auth state lives in `useAuthContext()` (Clerk-backed). This store now
 * only holds optional loading/error UI state. Writing to `session` is no
 * longer wired in the migrated middleware — kept as a read API for callers
 * during the deprecation window.
 */
interface MinimalSession {
  user?: {
    id?: string;
    email?: string;
  };
}

interface AuthState {
  session: MinimalSession | null;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    session: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state): boolean => {
      return !!state.session;
    },

    userId: (state): string | null => {
      return state.session?.user?.id ?? null;
    },

    userEmail: (state): string | null => {
      return state.session?.user?.email ?? null;
    },
  },

  actions: {
    setSession(session: MinimalSession | null) {
      this.session = session;
    },

    setLoading(loading: boolean) {
      this.loading = loading;
    },

    setError(error: string | null) {
      this.error = error;
    },

    reset() {
      this.session = null;
      this.loading = false;
      this.error = null;
    },
  },
});
