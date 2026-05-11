import { defineStore } from 'pinia'
import type { Session } from '@supabase/supabase-js'

interface AuthState {
  session: Session | null
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    session: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state): boolean => {
      return !!state.session
    },

    userId: (state): string | null => {
      return state.session?.user?.id ?? null
    },

    userEmail: (state): string | null => {
      return state.session?.user?.email ?? null
    },
  },

  actions: {
    setSession(session: Session | null) {
      this.session = session
    },

    setLoading(loading: boolean) {
      this.loading = loading
    },

    setError(error: string | null) {
      this.error = error
    },

    reset() {
      this.session = null
      this.loading = false
      this.error = null
    },
  },
})


