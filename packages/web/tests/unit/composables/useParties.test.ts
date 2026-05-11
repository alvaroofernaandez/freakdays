import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

import { useParties } from "../../../app/composables/useParties";
import { useAuthStore } from "../../../stores/auth";

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
};

const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  del: vi.fn(),
  normalizeApiError: vi.fn((error: unknown) => {
    if (typeof error === "object" && error !== null) {
      return error as { message: string; statusCode?: number };
    }

    return {
      message: "error",
    };
  }),
};

vi.mock("../../../app/composables/useToast", () => ({
  useToast: () => mockToast,
}));

vi.mock("../../../app/composables/useApiClient", () => ({
  useApiClient: () => mockApi,
}));

vi.mock("../../../app/composables/useAuthContext", () => ({
  useAuthContext: () => ({
    refresh: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe("useParties", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("retorna [] en fetchUserParties sin usuario autenticado", async () => {
    const authStore = useAuthStore();
    authStore.setSession(null);

    const partiesApi = useParties();
    const parties = await partiesApi.fetchUserParties();

    expect(parties).toEqual([]);
  });

  it("consume GET /v1/party y mapea Party correctamente", async () => {
    const authStore = useAuthStore();
    authStore.setSession({
      user: { id: "user-1" },
      access_token: "token",
      refresh_token: "refresh",
      expires_in: 3600,
      expires_at: 0,
      token_type: "bearer",
    } as never);

    mockApi.get.mockResolvedValue([
      {
        id: "party-1",
        organizationId: "org-1",
        name: "Party migrada",
        description: null,
        inviteCode: "ABC123",
        ownerId: "user-1",
        maxMembers: 10,
        createdAt: new Date("2026-03-01T00:00:00.000Z").toISOString(),
        updatedAt: new Date("2026-03-01T00:00:00.000Z").toISOString(),
        members: [],
      },
    ]);

    const partiesApi = useParties();
    const parties = await partiesApi.fetchUserParties();

    expect(mockApi.get).toHaveBeenCalledWith("/v1/party", {
      requireOrg: true,
    });
    expect(parties).toHaveLength(1);
    expect(parties[0]?.name).toBe("Party migrada");
    expect(parties[0]?.createdAt).toBeInstanceOf(Date);
  });

  it("crea party por API y devuelve entidad mapeada", async () => {
    const authStore = useAuthStore();
    authStore.setSession({
      user: { id: "user-1" },
      access_token: "token",
      refresh_token: "refresh",
      expires_in: 3600,
      expires_at: 0,
      token_type: "bearer",
    } as never);

    mockApi.post.mockResolvedValue({
      id: "party-1",
      organizationId: "org-1",
      name: "Nueva party",
      description: null,
      inviteCode: "ZXCV12",
      ownerId: "user-1",
      maxMembers: 10,
      createdAt: new Date("2026-03-01T00:00:00.000Z").toISOString(),
      updatedAt: new Date("2026-03-01T00:00:00.000Z").toISOString(),
      members: [],
    });

    const partiesApi = useParties();
    const party = await partiesApi.createParty("Nueva party");

    expect(mockApi.post).toHaveBeenCalledWith(
      "/v1/party",
      {
        name: "Nueva party",
        description: null,
      },
      { requireOrg: true }
    );
    expect(party?.inviteCode).toBe("ZXCV12");
  });
});
