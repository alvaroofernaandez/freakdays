import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../../../stores/auth';
import type { LegacyAuthSession } from '../../../app/types/legacy-auth';

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('initialization', () => {
    it('should initialize with null session', () => {
      const store = useAuthStore();

      expect(store.session).toBeNull();
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });

    it('should initialize with correct default state', () => {
      const store = useAuthStore();

      expect(store.isAuthenticated).toBe(false);
      expect(store.userId).toBeNull();
      expect(store.userEmail).toBeNull();
    });
  });

  describe('getters', () => {
    it('isAuthenticated should return false when session is null', () => {
      const store = useAuthStore();

      expect(store.isAuthenticated).toBe(false);
    });

    it('isAuthenticated should return true when session exists', () => {
      const store = useAuthStore();
      const mockSession: LegacyAuthSession = {
        access_token: 'token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Date.now() + 3600,
        refresh_token: 'refresh',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        },
      };

      store.setSession(mockSession);

      expect(store.isAuthenticated).toBe(true);
    });

    it('userId should return null when session is null', () => {
      const store = useAuthStore();

      expect(store.userId).toBeNull();
    });

    it('userId should return user id when session exists', () => {
      const store = useAuthStore();
      const mockSession: LegacyAuthSession = {
        access_token: 'token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Date.now() + 3600,
        refresh_token: 'refresh',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        },
      };

      store.setSession(mockSession);

      expect(store.userId).toBe('user-123');
    });

    it('userEmail should return null when session is null', () => {
      const store = useAuthStore();

      expect(store.userEmail).toBeNull();
    });

    it('userEmail should return email when session exists', () => {
      const store = useAuthStore();
      const mockSession: LegacyAuthSession = {
        access_token: 'token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Date.now() + 3600,
        refresh_token: 'refresh',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        },
      };

      store.setSession(mockSession);

      expect(store.userEmail).toBe('test@example.com');
    });

    it('userId should return null when user is missing', () => {
      const store = useAuthStore();
      const mockSession: LegacyAuthSession = {
        access_token: 'token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Date.now() + 3600,
        refresh_token: 'refresh',
        user: null as any,
      };

      store.setSession(mockSession);

      expect(store.userId).toBeNull();
    });

    it('userEmail should return null when user is missing', () => {
      const store = useAuthStore();
      const mockSession: LegacyAuthSession = {
        access_token: 'token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Date.now() + 3600,
        refresh_token: 'refresh',
        user: null as any,
      };

      store.setSession(mockSession);

      expect(store.userEmail).toBeNull();
    });
  });

  describe('actions', () => {
    it('setSession should update session', () => {
      const store = useAuthStore();
      const mockSession: LegacyAuthSession = {
        access_token: 'token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Date.now() + 3600,
        refresh_token: 'refresh',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        },
      };

      store.setSession(mockSession);

      expect(store.session).toStrictEqual(mockSession);
      expect(store.isAuthenticated).toBe(true);
    });

    it('setSession should clear session when null', () => {
      const store = useAuthStore();
      const mockSession: LegacyAuthSession = {
        access_token: 'token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Date.now() + 3600,
        refresh_token: 'refresh',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        },
      };

      store.setSession(mockSession);
      store.setSession(null);

      expect(store.session).toBeNull();
      expect(store.isAuthenticated).toBe(false);
    });

    it('setLoading should update loading state', () => {
      const store = useAuthStore();

      store.setLoading(true);
      expect(store.loading).toBe(true);

      store.setLoading(false);
      expect(store.loading).toBe(false);
    });

    it('setError should update error state', () => {
      const store = useAuthStore();

      store.setError('Test error');
      expect(store.error).toBe('Test error');

      store.setError(null);
      expect(store.error).toBeNull();
    });

    it('reset should clear all state', () => {
      const store = useAuthStore();
      const mockSession: LegacyAuthSession = {
        access_token: 'token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Date.now() + 3600,
        refresh_token: 'refresh',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        },
      };

      store.setSession(mockSession);
      store.setLoading(true);
      store.setError('Error message');
      store.reset();

      expect(store.session).toBeNull();
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.isAuthenticated).toBe(false);
      expect(store.userId).toBeNull();
      expect(store.userEmail).toBeNull();
    });
  });
});
