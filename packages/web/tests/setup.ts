/// <reference types="node" />
import { config } from '@vue/test-utils';
import { vi } from 'vitest';

// Mock Pinia store
import { createTestingPinia } from '@pinia/testing';
import { ref } from 'vue';

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
