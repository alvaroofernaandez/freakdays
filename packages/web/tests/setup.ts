/// <reference types="node" />
import { config } from "@vue/test-utils";
import { vi } from "vitest";

// Mock Nuxt runtime config
vi.stubGlobal("useRuntimeConfig", () => ({
  public: {
    supabase: {
      url: "https://example.supabase.co",
      key: "example-key",
    },
    supabaseUrl: "https://example.supabase.co",
    supabaseAnonKey: "example-key",
  },
}));

// Mock Supabase User
const mockSupabaseUser = {
  id: "test-user-id",
  email: "test@example.com",
};

// Mock useSupabaseUser
vi.stubGlobal("useSupabaseUser", () => ref(mockSupabaseUser));

// Mock useSupabaseClient
vi.stubGlobal("useSupabaseClient", () => ({
  auth: {
    getSession: vi
      .fn()
      .mockResolvedValue({ data: { session: { user: mockSupabaseUser } } }),
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
  },
}));

// Mock navigateTo
vi.stubGlobal("navigateTo", vi.fn());

// Mock imports that might be causing issues
vi.mock("#imports", async () => {
  return {
    useNuxtApp: () => ({
      $supabase: {},
      payload: {},
    }),
    useRuntimeConfig: () => ({
      public: {
        supabase: {
          url: "https://example.supabase.co",
          key: "example-key",
        },
        supabaseUrl: "https://example.supabase.co",
        supabaseAnonKey: "example-key",
      },
    }),
    useSupabaseUser: () => ref(mockSupabaseUser),
    navigateTo: vi.fn(),
    defineNuxtRouteMiddleware: (handler: any) => handler,
  };
});

// Mock Pinia store
import { createTestingPinia } from "@pinia/testing";
import { ref } from "vue";

config.global.plugins = [
  createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
    initialState: {
      auth: {
        session: { user: mockSupabaseUser },
        user: mockSupabaseUser,
      },
    },
  }),
];

// Mock useAuthStore specifically for middleware
vi.mock("@/stores/auth", () => ({
  useAuthStore: () => ({
    session: { user: mockSupabaseUser },
    user: mockSupabaseUser,
    reset: vi.fn(),
    setSession: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
  }),
}));

// Mock useSupabase composable
vi.mock("@/composables/useSupabase", () => ({
  useSupabase: () => ({
    auth: {
      getSession: vi
        .fn()
        .mockResolvedValue({ data: { session: { user: mockSupabaseUser } } }),
      getUser: vi.fn().mockResolvedValue({ data: { user: mockSupabaseUser } }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: () => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
    }),
  }),
}));
