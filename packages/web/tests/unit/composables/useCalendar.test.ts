import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

import { useCalendar } from "../../../app/composables/useCalendar";
import { useAuthStore } from "../../../stores/auth";

const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  normalizeApiError: vi.fn((error: unknown) => {
    if (typeof error === "object" && error !== null) {
      return error as { statusCode?: number; message: string; code?: string };
    }

    return {
      message: "unknown",
    };
  }),
};

vi.mock("../../../app/composables/useApiClient", () => ({
  useApiClient: () => mockApi,
}));

vi.mock("../../../app/composables/useAuthContext", () => ({
  useAuthContext: () => ({
    refresh: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe("useCalendar", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("consume GET /v1/calendar/releases y mapea fechas", async () => {
    const authStore = useAuthStore();
    authStore.setSession({ user: { id: "user-1" } } as never);

    mockApi.get.mockResolvedValue([
      {
        id: "release-1",
        title: "Capítulo 1",
        type: "anime_episode",
        releaseDate: "2026-04-01T00:00:00.000Z",
        description: null,
        url: null,
        createdAt: "2026-04-01T00:00:00.000Z",
        updatedAt: "2026-04-01T00:00:00.000Z",
      },
    ]);

    const calendar = useCalendar();
    const releases = await calendar.fetchReleases();

    expect(mockApi.get).toHaveBeenCalledWith("/v1/calendar/releases", {
      requireOrg: true,
    });
    expect(releases).toHaveLength(1);
    expect(releases[0]?.releaseDate).toBeInstanceOf(Date);
    expect(releases[0]?.title).toBe("Capítulo 1");
  });

  it("ante error de API propaga error normalizado", async () => {
    const authStore = useAuthStore();
    authStore.setSession({ user: { id: "user-1" } } as never);

    mockApi.get.mockRejectedValue({ statusCode: 404, message: "Not found" });

    const calendar = useCalendar();
    await expect(calendar.fetchReleases()).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
