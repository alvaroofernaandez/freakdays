const ACTIVE_ORG_STORAGE_KEY = "freak-days:active-org-id";

export function useOrganizationContext() {
  const authContext = useAuthContext();

  const activeOrgId = useState<string | null>("organization-context:active-org-id", () => null);
  const hasHydrated = useState<boolean>("organization-context:hydrated", () => false);

  function persistActiveOrgId(nextOrgId: string | null) {
    if (!import.meta.client) {
      return;
    }

    if (nextOrgId) {
      window.localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, nextOrgId);
      return;
    }

    window.localStorage.removeItem(ACTIVE_ORG_STORAGE_KEY);
  }

  function applyActiveOrgId(nextOrgId: string | null, persist: boolean) {
    activeOrgId.value = nextOrgId;
    authContext.setOrgId(nextOrgId);

    if (persist) {
      persistActiveOrgId(nextOrgId);
    }
  }

  function setActiveOrgId(orgId: string | null) {
    applyActiveOrgId(orgId, true);
  }

  function clearActiveOrgId() {
    applyActiveOrgId(null, true);
  }

  function hydrateFromStorage() {
    if (!import.meta.client || hasHydrated.value) {
      return;
    }

    hasHydrated.value = true;

    const storedOrgId = window.localStorage.getItem(ACTIVE_ORG_STORAGE_KEY);

    if (storedOrgId) {
      applyActiveOrgId(storedOrgId, false);
    }
  }

  hydrateFromStorage();

  return {
    activeOrgId,
    setActiveOrgId,
    clearActiveOrgId,
    hydrateFromStorage,
  };
}
