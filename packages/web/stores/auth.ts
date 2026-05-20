import { defineStore } from 'pinia';

/**
 * Minimal session shape kept for backward compatibility with components that
 * still read `authStore.session?.user?.id / .email`. Replaces the previous
 * `Session` import from `@supabase/supabase-js` (Supabase was removed in S8.2
 * of the migration; see docs/migrations/supabase-to-clerk-nestjs.md).
 *
 * Live auth state lives in `useAuthContext()` (Clerk-backed). `isAuthenticated`
 * is derived from `user` (set from `window.Clerk.user` after initialization)
 * rather than `session`, which is always null in the Clerk-only runtime.
 */
interface MinimalSession {
  user?: {
    id?: string;
    email?: string;
  };
}

interface ClerkUserLike {
  id?: string;
  primaryEmailAddress?: { emailAddress?: string } | null;
}

interface AuthState {
  session: MinimalSession | null;
  user: ClerkUserLike | null;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    session: null,
    user: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state): boolean => {
      return !!state.user;
    },

    userId: (state): string | null => {
      return state.user?.id ?? state.session?.user?.id ?? null;
    },

    userEmail: (state): string | null => {
      return state.user?.primaryEmailAddress?.emailAddress ?? state.session?.user?.email ?? null;
    },
  },

  actions: {
    setUser(user: ClerkUserLike | null) {
      this.user = user;
    },

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
      this.user = null;
      this.loading = false;
      this.error = null;
    },
  },
});
