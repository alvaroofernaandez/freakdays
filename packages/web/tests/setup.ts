/// <reference types="node" />
import { config } from '@vue/test-utils';
import { vi } from 'vitest';

// Mock Pinia store
import { createTestingPinia } from '@pinia/testing';
import { ref } from 'vue';

// happy-dom provides window.localStorage, but the 'nuxt' vitest environment
// occasionally ships a stripped-down Storage proxy that doesn't expose
// getItem/setItem/clear as functions. Pin an in-memory implementation here
// so tests can rely on a real Storage interface.
const storageBackend = new Map<string, string>();
const localStorageMock: Storage = {
  get length() {
    return storageBackend.size;
  },
  clear: () => storageBackend.clear(),
  getItem: (key) => storageBackend.get(key) ?? null,
  key: (index) => [...storageBackend.keys()][index] ?? null,
  removeItem: (key) => {
    storageBackend.delete(key);
  },
  setItem: (key, value) => {
    storageBackend.set(key, String(value));
  },
};

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  Object.defineProperty(window, 'sessionStorage', {
    value: localStorageMock,
    writable: true,
  });
}

// Mock Nuxt runtime config
vi.stubGlobal('useRuntimeConfig', () => ({
  public: {
    apiUrl: 'http://localhost:3001',
  },
}));

// Test user shape kept minimal — mirrors what auth store getters read.
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
};

// Mock navigateTo
vi.stubGlobal('navigateTo', vi.fn());

// Mock imports that might be causing issues
vi.mock('#imports', async () => {
  return {
    useNuxtApp: () => ({
      payload: {},
    }),
    useRuntimeConfig: () => ({
      public: {
        apiUrl: 'http://localhost:3001',
      },
    }),
    navigateTo: vi.fn(),
    defineNuxtRouteMiddleware: (handler: any) => handler,
  };
});

config.global.plugins = [
  createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: {
      auth: {
        session: { user: mockUser },
      },
    },
  }),
];

// Mock useAuthStore specifically for middleware tests.
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    session: { user: mockUser },
    reset: vi.fn(),
    setSession: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
  }),
}));
