import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref, type Ref } from "vue";
import { useOrganizationContext } from "../../../app/composables/useOrganizationContext";

const setOrgIdMock = vi.fn();

vi.mock("../../../app/composables/useAuthContext", () => ({
  useAuthContext: () => ({
    setOrgId: setOrgIdMock,
  }),
}));

describe("useOrganizationContext", () => {
  const stateMap = new Map<string, Ref<unknown>>();

  beforeEach(() => {
    vi.clearAllMocks();
    stateMap.clear();
    window.localStorage.clear();

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

  it("setea org activa, persiste en storage y sincroniza auth context", () => {
    const orgContext = useOrganizationContext();

    orgContext.setActiveOrgId("org-123");

    expect(orgContext.activeOrgId.value).toBe("org-123");
    expect(window.localStorage.getItem("freak-days:active-org-id")).toBe("org-123");
    expect(setOrgIdMock).toHaveBeenCalledWith("org-123");
  });

  it("clearActiveOrgId limpia state/storage y sincroniza null", () => {
    const orgContext = useOrganizationContext();
    orgContext.setActiveOrgId("org-123");

    orgContext.clearActiveOrgId();

    expect(orgContext.activeOrgId.value).toBeNull();
    expect(window.localStorage.getItem("freak-days:active-org-id")).toBeNull();
    expect(setOrgIdMock).toHaveBeenLastCalledWith(null);
  });

  it("hidrata una sola vez desde localStorage", () => {
    const orgContext = useOrganizationContext();
    orgContext.setActiveOrgId("org-manual");
    setOrgIdMock.mockClear();

    orgContext.hydrateFromStorage();
    orgContext.hydrateFromStorage();

    expect(orgContext.activeOrgId.value).toBe("org-manual");
    expect(setOrgIdMock).not.toHaveBeenCalled();
  });
});
