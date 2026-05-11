import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAnime } from "../../../app/composables/useAnime";
import { useAuthStore } from "../../../stores/auth";

const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  del: vi.fn(),
  normalizeApiError: vi.fn((error: unknown) =>
    typeof error === "object" && error !== null
      ? (error as { message: string })
      : { message: "error" }
  ),
};

const mockAuthRefresh = vi.fn().mockResolvedValue(undefined);

vi.mock("../../../app/composables/useApiClient", () => ({
  useApiClient: () => mockApi,
}));

vi.mock("../../../app/composables/useAuthContext", () => ({
  useAuthContext: () => ({
    refresh: mockAuthRefresh,
  }),
}));

describe("useAnime", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe("fetchAnimeList", () => {
    it("retorna [] cuando no hay usuario autenticado", async () => {
      const authStore = useAuthStore();
      authStore.setSession(null);

      const animeApi = useAnime();
      const list = await animeApi.fetchAnimeList();

      expect(list).toEqual([]);
      expect(mockApi.get).not.toHaveBeenCalled();
    });

    it("consume GET /v1/anime y mapea resultados", async () => {
      const authStore = useAuthStore();
      authStore.setSession({ user: { id: "user-1" } } as never);

      mockApi.get.mockResolvedValue([
        {
          id: "1",
          title: "Test Anime",
          status: "watching",
          currentEpisode: 5,
          totalEpisodes: 12,
          score: null,
          notes: null,
          coverUrl: null,
          startDate: null,
          endDate: null,
          rewatchCount: 0,
          createdAt: new Date("2026-03-01T00:00:00.000Z").toISOString(),
          updatedAt: new Date("2026-03-01T00:00:00.000Z").toISOString(),
        },
      ]);

      const animeApi = useAnime();
      const list = await animeApi.fetchAnimeList();

      expect(mockApi.get).toHaveBeenCalledWith("/v1/anime", {
        requireOrg: true,
      });
      expect(list).toHaveLength(1);
      expect(list[0]?.title).toBe("Test Anime");
    });
  });

  describe("addAnime", () => {
    it("retorna null cuando no hay usuario", async () => {
      const authStore = useAuthStore();
      authStore.setSession(null);

      const animeApi = useAnime();
      const result = await animeApi.addAnime({
        title: "Test",
        status: "watching",
      });

      expect(result).toBeNull();
      expect(mockApi.post).not.toHaveBeenCalled();
    });

    it("retorna null cuando el título está vacío", async () => {
      const authStore = useAuthStore();
      authStore.setSession({ user: { id: "user-1" } } as never);

      const animeApi = useAnime();
      const result = await animeApi.addAnime({
        title: "",
        status: "watching",
      });

      expect(result).toBeNull();
      expect(mockApi.post).not.toHaveBeenCalled();
    });

    it("crea anime con POST /v1/anime", async () => {
      const authStore = useAuthStore();
      authStore.setSession({ user: { id: "user-1" } } as never);

      mockApi.post.mockResolvedValue({
        id: "1",
        title: "Test Anime",
        status: "watching",
        currentEpisode: 0,
        totalEpisodes: 12,
        score: null,
        notes: null,
        coverUrl: null,
        startDate: null,
        endDate: null,
        rewatchCount: 0,
        createdAt: new Date("2026-03-01T00:00:00.000Z").toISOString(),
        updatedAt: new Date("2026-03-01T00:00:00.000Z").toISOString(),
      });

      const animeApi = useAnime();
      const result = await animeApi.addAnime({
        title: "Test Anime",
        status: "watching",
        total_episodes: 12,
      });

      expect(result?.title).toBe("Test Anime");
      expect(mockApi.post).toHaveBeenCalledWith(
        "/v1/anime",
        {
          title: "Test Anime",
          status: "watching",
          total_episodes: 12,
        },
        { requireOrg: true }
      );
    });
  });

  describe("updateStatus", () => {
    it("actualiza estado con PATCH /v1/anime/:id", async () => {
      const authStore = useAuthStore();
      authStore.setSession({ user: { id: "user-1" } } as never);

      mockApi.patch.mockResolvedValue({});

      const animeApi = useAnime();
      const result = await animeApi.updateStatus("1", "completed");

      expect(result).toBe(true);
      expect(mockApi.patch).toHaveBeenCalledWith(
        "/v1/anime/1",
        expect.objectContaining({ status: "completed" }),
        { requireOrg: true }
      );
    });
  });

  describe("deleteAnime", () => {
    it("retorna false cuando delete falla", async () => {
      const authStore = useAuthStore();
      authStore.setSession({ user: { id: "user-1" } } as never);

      mockApi.del.mockRejectedValue(new Error("Delete failed"));

      const animeApi = useAnime();
      const result = await animeApi.deleteAnime("1");

      expect(result).toBe(false);
    });

    it("retorna true cuando delete funciona", async () => {
      const authStore = useAuthStore();
      authStore.setSession({ user: { id: "user-1" } } as never);

      mockApi.del.mockResolvedValue({ success: true });

      const animeApi = useAnime();
      const result = await animeApi.deleteAnime("1");

      expect(result).toBe(true);
      expect(mockApi.del).toHaveBeenCalledWith("/v1/anime/1", {
        requireOrg: true,
      });
    });
  });
});
