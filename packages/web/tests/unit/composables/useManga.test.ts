import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useManga } from "../../../app/composables/useManga";
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

describe("useManga", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe("fetchCollection", () => {
    it("retorna [] cuando no hay sesión", async () => {
      const authStore = useAuthStore();
      authStore.setSession(null);

      const mangaApi = useManga();
      const collection = await mangaApi.fetchCollection();

      expect(collection).toEqual([]);
      expect(mockApi.get).not.toHaveBeenCalled();
    });

    it("consume GET /v1/manga y mapea colección", async () => {
      const authStore = useAuthStore();
      authStore.setSession({ user: { id: "user-1" } } as never);

      mockApi.get.mockResolvedValue([
        {
          id: "1",
          title: "Test Manga",
          author: "Test Author",
          totalVolumes: 10,
          ownedVolumes: [1, 2, 3],
          status: "collecting",
          score: null,
          notes: null,
          coverUrl: null,
          pricePerVolume: 10.5,
          totalCost: 31.5,
          createdAt: new Date("2026-03-01T00:00:00.000Z").toISOString(),
          updatedAt: new Date("2026-03-01T00:00:00.000Z").toISOString(),
        },
      ]);

      const mangaApi = useManga();
      const collection = await mangaApi.fetchCollection();

      expect(mockApi.get).toHaveBeenCalledWith("/v1/manga", {
        requireOrg: true,
      });
      expect(collection).toHaveLength(1);
      expect(collection[0]?.title).toBe("Test Manga");
    });
  });

  describe("addManga", () => {
    it("retorna null cuando no hay sesión", async () => {
      const authStore = useAuthStore();
      authStore.setSession(null);

      const mangaApi = useManga();
      const result = await mangaApi.addManga({ title: "Test" });

      expect(result).toBeNull();
      expect(mockApi.post).not.toHaveBeenCalled();
    });

    it("crea manga con POST /v1/manga", async () => {
      const authStore = useAuthStore();
      authStore.setSession({ user: { id: "user-1" } } as never);

      mockApi.post.mockResolvedValue({
        id: "1",
        title: "Test Manga",
        author: "Test Author",
        totalVolumes: 10,
        ownedVolumes: [],
        status: "collecting",
        score: null,
        notes: null,
        coverUrl: null,
        pricePerVolume: 10.5,
        totalCost: 0,
        createdAt: new Date("2026-03-01T00:00:00.000Z").toISOString(),
        updatedAt: new Date("2026-03-01T00:00:00.000Z").toISOString(),
      });

      const mangaApi = useManga();
      const result = await mangaApi.addManga({
        title: "Test Manga",
        author: "Test Author",
      });

      expect(result?.title).toBe("Test Manga");
      expect(mockApi.post).toHaveBeenCalledWith(
        "/v1/manga",
        {
          title: "Test Manga",
          author: "Test Author",
        },
        { requireOrg: true }
      );
    });
  });

  describe("addVolume", () => {
    it("retorna false cuando no encuentra manga", async () => {
      const authStore = useAuthStore();
      authStore.setSession({ user: { id: "user-1" } } as never);

      mockApi.get.mockResolvedValue([]);

      const mangaApi = useManga();
      const result = await mangaApi.addVolume("missing", 1);

      expect(result).toBe(false);
    });

    it("agrega volumen y ejecuta PATCH /v1/manga/:id", async () => {
      const authStore = useAuthStore();
      authStore.setSession({ user: { id: "user-1" } } as never);

      mockApi.get.mockResolvedValue([
        {
          id: "1",
          title: "Manga 1",
          author: null,
          totalVolumes: 10,
          ownedVolumes: [1, 2],
          status: "collecting",
          score: null,
          notes: null,
          coverUrl: null,
          pricePerVolume: 10.5,
          totalCost: 21,
          createdAt: new Date("2026-03-01T00:00:00.000Z").toISOString(),
          updatedAt: new Date("2026-03-01T00:00:00.000Z").toISOString(),
        },
      ]);
      mockApi.patch.mockResolvedValue({});

      const mangaApi = useManga();
      const result = await mangaApi.addVolume("1", 3);

      expect(result).toBe(true);
      expect(mockApi.patch).toHaveBeenCalledWith(
        "/v1/manga/1",
        expect.objectContaining({ ownedVolumes: [1, 2, 3] }),
        { requireOrg: true }
      );
    });
  });
});
