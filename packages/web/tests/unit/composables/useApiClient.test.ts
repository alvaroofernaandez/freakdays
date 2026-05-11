import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../../app/utils/error-handling";
import { useApiClient } from "../../../app/composables/useApiClient";

const mockFetch = vi.fn();

const mockAuthContext = {
  token: { value: "token-123" },
  orgId: { value: "org-abc" },
  getAccessToken: vi.fn(() => "token-123"),
  getOrgId: vi.fn(() => "org-abc"),
};

const mockOrganizationContext = {
  activeOrgId: { value: "org-selected" as string | null },
};

vi.mock("../../../app/composables/useAuthContext", () => ({
  useAuthContext: () => mockAuthContext,
}));

vi.mock("../../../app/composables/useOrganizationContext", () => ({
  useOrganizationContext: () => mockOrganizationContext,
}));

describe("useApiClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthContext.getAccessToken.mockReturnValue("token-123");
    mockAuthContext.getOrgId.mockReturnValue("org-abc");
    mockOrganizationContext.activeOrgId.value = "org-selected";
    vi.stubGlobal("$fetch", mockFetch);
  });

  it("adjunta Authorization y x-org-id cuando existen", async () => {
    mockFetch.mockResolvedValue({ ok: true });
    const api = useApiClient();

    await api.get("/health");

    expect(mockFetch).toHaveBeenCalledWith(
      "/health",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token-123",
          "x-org-id": "org-selected",
        }),
        baseURL: "/api",
      })
    );
  });

  it("usa orgId del auth context como fallback cuando no hay org activa", async () => {
    mockFetch.mockResolvedValue({ ok: true });
    mockOrganizationContext.activeOrgId.value = null;
    mockAuthContext.getOrgId.mockReturnValue("org-abc");

    const api = useApiClient();
    await api.get("/tenant");

    expect(mockFetch).toHaveBeenCalledWith(
      "/tenant",
      expect.objectContaining({
        headers: expect.objectContaining({
          "x-org-id": "org-abc",
        }),
      })
    );
  });

  it("no adjunta headers auth si no hay token ni org", async () => {
    mockFetch.mockResolvedValue({ ok: true });
    mockAuthContext.getAccessToken.mockReturnValue(null);
    mockAuthContext.getOrgId.mockReturnValue(null);
    mockOrganizationContext.activeOrgId.value = null;

    const api = useApiClient();
    await api.get("/public");

    expect(mockFetch).toHaveBeenCalledWith(
      "/public",
      expect.objectContaining({
        headers: {},
      })
    );
  });

  it("normaliza error de API como AppError", async () => {
    mockFetch.mockRejectedValue({
      status: 401,
      data: {
        message: "Token expirado",
      },
    });

    const api = useApiClient();
    const requestPromise = api.get("/private");

    await expect(requestPromise).rejects.toBeInstanceOf(AppError);
    await expect(requestPromise).rejects.toMatchObject({
      statusCode: 401,
      message: "Token expirado",
    });
  });

  it("falla si requireOrg es true y no hay orgId", async () => {
    mockAuthContext.getOrgId.mockReturnValue(null);
    mockOrganizationContext.activeOrgId.value = null;
    const api = useApiClient();

    await expect(api.get("/tenant-only", { requireOrg: true })).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
