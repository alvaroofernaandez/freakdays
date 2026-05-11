import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

import { useProfile } from "../../../app/composables/useProfile";
import { useAuthStore } from "../../../stores/auth";

const mockFetch = vi.fn();

const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  normalizeApiError: vi.fn((error: unknown) => {
    if (typeof error === "object" && error !== null) {
      return error as { message: string; statusCode?: number; code?: string };
    }

    return {
      message: "error",
    };
  }),
};

const mockAuthContext = {
  refresh: vi.fn().mockResolvedValue(undefined),
  getAccessToken: vi.fn(() => "token"),
};

vi.mock("../../../app/composables/useApiClient", () => ({
  useApiClient: () => mockApi,
}));

vi.mock("../../../app/composables/useAuthContext", () => ({
  useAuthContext: () => mockAuthContext,
}));

describe("useProfile", () => {
  beforeAll(() => {
    vi.stubGlobal("$fetch", mockFetch);
    vi.stubGlobal("fetch", vi.fn());
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockFetch.mockReset();
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockReset();
    mockAuthContext.getAccessToken.mockReturnValue("token");
  });

  it("retorna null cuando no hay contexto de autenticación", async () => {
    const authStore = useAuthStore();
    authStore.setSession(null);
    mockAuthContext.getAccessToken.mockReturnValue(null);

    const profileApi = useProfile();
    const result = await profileApi.fetchProfile();

    expect(result).toBe(null);
    expect(mockApi.get).not.toHaveBeenCalled();
  });

  it("consume /v1/profile/me y mapea perfil", async () => {
    const authStore = useAuthStore();
    authStore.setSession({ user: { id: "user-1" } } as never);

    mockApi.get.mockResolvedValue({
      id: "profile-1",
      username: "testuser",
      displayName: "Test User",
      avatarUrl: null,
      bannerUrl: null,
      totalExp: 120,
      level: 2,
      bio: null,
      favoriteAnimeId: null,
      favoriteMangaId: null,
      location: null,
      website: null,
      socialLinks: {},
    });

    const profileApi = useProfile();
    const profile = await profileApi.fetchProfile();

    expect(mockApi.get).toHaveBeenCalledWith("/v1/profile/me");
    expect(profile?.username).toBe("testuser");
    expect(profile?.level).toBe(2);
  });

  it("cuando /v1/profile/me falla retorna null sin usar endpoints legacy", async () => {
    const authStore = useAuthStore();
    authStore.setSession({ user: { id: "user-1" } } as never);

    mockApi.get.mockRejectedValue({ statusCode: 404, message: "Not found" });

    const profileApi = useProfile();
    const profile = await profileApi.fetchProfile();

    expect(profile).toBe(null);
    expect(mockFetch).not.toHaveBeenCalledWith("/api/profile/user-1");
  });

  it("sube avatar con signed URL y confirma en backend", async () => {
    const authStore = useAuthStore();
    authStore.setSession({ user: { id: "user-1" } } as never);

    mockApi.post
      .mockResolvedValueOnce({
        uploadUrl: "https://signed-upload.example.com/avatar",
        key: "profiles/clerk_123/avatars/test.jpg",
        publicUrl: "https://assets.example.com/profiles/clerk_123/avatars/test.jpg",
        expiresIn: 600,
      })
      .mockResolvedValueOnce({
        avatarUrl: "https://assets.example.com/profiles/clerk_123/avatars/test.jpg",
        avatarKey: "profiles/clerk_123/avatars/test.jpg",
      });

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
    });

    const profileApi = useProfile();
    const file = new File(["avatar"], "avatar.jpg", { type: "image/jpeg" });
    const url = await profileApi.uploadAvatar(file);

    expect(mockApi.post).toHaveBeenNthCalledWith(
      1,
      "/v1/profile/me/avatar/upload-url",
      {
        contentType: "image/jpeg",
        fileName: "avatar.jpg",
      }
    );
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://signed-upload.example.com/avatar",
      expect.objectContaining({ method: "PUT" })
    );
    expect(mockApi.post).toHaveBeenNthCalledWith(
      2,
      "/v1/profile/me/avatar/confirm",
      {
        key: "profiles/clerk_123/avatars/test.jpg",
      }
    );
    expect(url).toBe("https://assets.example.com/profiles/clerk_123/avatars/test.jpg");
  });

  it("si upload banner API falla retorna null sin fallback legacy", async () => {
    const authStore = useAuthStore();
    authStore.setSession({ user: { id: "user-1" } } as never);

    mockApi.post.mockRejectedValue({ statusCode: 501, message: "Not implemented" });

    const profileApi = useProfile();
    const file = new File(["banner"], "banner.jpg", { type: "image/jpeg" });
    const url = await profileApi.uploadBanner(file);

    expect(url).toBe(null);
    expect(mockFetch).not.toHaveBeenCalledWith(
      "/api/profile/user-1",
      expect.anything()
    );
  });
});
