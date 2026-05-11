import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref, type Ref } from "vue";
import { useAuthContext } from "../../../app/composables/useAuthContext";

const mockAuthStore = {
  session: null as any,
};

vi.mock("../../../stores/auth", () => ({
  useAuthStore: () => mockAuthStore,
}));

describe("useAuthContext", () => {
  const stateMap = new Map<string, Ref<unknown>>();

  beforeEach(() => {
    vi.clearAllMocks();
    stateMap.clear();
    mockAuthStore.session = null;
    delete (window as Window & { Clerk?: unknown }).Clerk;

    vi.stubGlobal(
      "useState",
      <T>(key: string, init?: () => T): Ref<T> => {
        if (!stateMap.has(key)) {
          stateMap.set(key, ref(init ? init() : undefined));
        }

        return stateMap.get(key) as Ref<T>;
      }
    );
  });

  it("sincroniza token desde auth store cuando no hay Clerk", async () => {
    mockAuthStore.session = {
      access_token: "store-token",
    };

    const authContext = useAuthContext();
    await authContext.refresh();

    expect(authContext.token.value).toBe("store-token");
    expect(authContext.source.value).toBe("auth-store");
    expect(authContext.getAccessToken()).toBe("store-token");
  });

  it("prioriza bridge Clerk cuando hay sesión activa", async () => {
    const getToken = vi.fn().mockResolvedValue("clerk-token");
    (window as Window & { Clerk?: unknown }).Clerk = {
      session: {
        getToken,
        lastActiveOrganizationId: "org-session",
      },
      organization: {
        id: "org-clerk",
      },
    };

    mockAuthStore.session = {
      access_token: "store-token",
    };

    const authContext = useAuthContext();
    await authContext.refresh();

    expect(getToken).toHaveBeenCalledOnce();
    expect(authContext.token.value).toBe("clerk-token");
    expect(authContext.orgId.value).toBe("org-clerk");
    expect(authContext.source.value).toBe("clerk");
  });

  it("usa org de sesión Clerk cuando no hay organization activa", async () => {
    (window as Window & { Clerk?: unknown }).Clerk = {
      session: {
        getToken: vi.fn().mockResolvedValue("clerk-token"),
        lastActiveOrganizationId: "org-last-active",
      },
    };

    const authContext = useAuthContext();
    await authContext.refresh();

    expect(authContext.orgId.value).toBe("org-last-active");
    expect(authContext.source.value).toBe("clerk");
  });

  it("resuelve orgId desde metadata del auth store y permite override explícito", async () => {
    mockAuthStore.session = {
      user: {
        app_metadata: {
          org_id: "org-from-metadata",
        },
      },
    };

    const authContext = useAuthContext();
    await authContext.refresh();

    expect(authContext.orgId.value).toBe("org-from-metadata");
    expect(authContext.source.value).toBe("auth-store");

    authContext.setOrgId("org-selected");

    expect(authContext.orgId.value).toBe("org-selected");
    expect(authContext.getOrgId()).toBe("org-selected");
  });

  it("limpia contexto cuando no hay Clerk ni sesión store", async () => {
    const authContext = useAuthContext();
    authContext.setContext({
      token: "token",
      orgId: "org-1",
      source: "auth-store",
    });

    await authContext.refresh();

    expect(authContext.token.value).toBeNull();
    expect(authContext.orgId.value).toBeNull();
    expect(authContext.source.value).toBe("none");
  });

  it("clear limpia contexto de sesión", () => {
    const authContext = useAuthContext();

    authContext.setContext({
      token: "token",
      orgId: "org-1",
      source: "auth-store",
    });

    authContext.clear();

    expect(authContext.token.value).toBeNull();
    expect(authContext.orgId.value).toBeNull();
    expect(authContext.source.value).toBe("none");
  });
});
