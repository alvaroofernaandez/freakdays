import { useAuthStore } from "~~/stores/auth";

type AuthContextSource = "none" | "auth-store" | "clerk";

interface LegacySessionLike {
  access_token?: string;
  user?: {
    app_metadata?: Record<string, unknown>;
    user_metadata?: Record<string, unknown>;
  };
}

interface AuthContextUpdate {
  token?: string | null;
  orgId?: string | null;
  source?: AuthContextSource;
}

interface ClerkSessionLike {
  getToken?: () => Promise<string | null> | string | null;
  lastActiveOrganizationId?: string | null;
}

interface ClerkLike {
  session?: ClerkSessionLike | null;
  organization?: {
    id?: string | null;
  } | null;
}

function getMetadataValue(
  metadata: Record<string, unknown> | undefined,
  keys: string[]
): string | null {
  if (!metadata) {
    return null;
  }

  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return null;
}

function resolveOrgIdFromSession(session: LegacySessionLike | null): string | null {
  if (!session?.user) {
    return null;
  }

  const metadataKeys = ["org_id", "orgId", "organization_id", "organizationId"];

  return (
    getMetadataValue(session.user.app_metadata, metadataKeys) ??
    getMetadataValue(session.user.user_metadata, metadataKeys)
  );
}

function getClerkBridge(): ClerkLike | null {
  if (!import.meta.client) {
    return null;
  }

  const maybeClerk = window.Clerk;

  if (!maybeClerk || typeof maybeClerk !== "object") {
    return null;
  }

  return maybeClerk as ClerkLike;
}

async function getClerkToken(session: ClerkSessionLike): Promise<string | null> {
  const tokenGetter = session.getToken;

  if (typeof tokenGetter !== "function") {
    return null;
  }

  const token = await tokenGetter();

  if (typeof token === "string" && token.length > 0) {
    return token;
  }

  return null;
}

export function useAuthContext() {
  const authStore = useAuthStore();

  const token = useState<string | null>("auth-context:token", () => null);
  const orgId = useState<string | null>("auth-context:org-id", () => null);
  const source = useState<AuthContextSource>("auth-context:source", () => "none");

  function getAccessToken(): string | null {
    return token.value;
  }

  function getOrgId(): string | null {
    return orgId.value;
  }

  function setContext(next: AuthContextUpdate) {
    if (Object.prototype.hasOwnProperty.call(next, "token")) {
      token.value = next.token ?? null;
    }

    if (Object.prototype.hasOwnProperty.call(next, "orgId")) {
      orgId.value = next.orgId ?? null;
    }

    if (Object.prototype.hasOwnProperty.call(next, "source") && next.source) {
      source.value = next.source;
    }
  }

  function setOrgId(nextOrgId: string | null) {
    orgId.value = nextOrgId;
  }

  function clear() {
    token.value = null;
    orgId.value = null;
    source.value = "none";
  }

  async function refresh() {
    const clerk = getClerkBridge();
    const clerkSession = clerk?.session;

    if (clerkSession) {
      try {
        const clerkToken = await getClerkToken(clerkSession);
        const clerkOrgId =
          clerk?.organization?.id ?? clerkSession.lastActiveOrganizationId ?? null;

        if (clerkToken || clerkOrgId) {
          setContext({
            token: clerkToken,
            orgId: clerkOrgId ?? orgId.value,
            source: "clerk",
          });

          return;
        }
      } catch {
        // fallback a authStore
      }
    }

    const legacySession = authStore.session as LegacySessionLike | null;
    const legacyOrgId = resolveOrgIdFromSession(legacySession);

    if (legacySession?.access_token || legacyOrgId) {
      setContext({
        token: legacySession?.access_token ?? null,
        orgId: legacyOrgId ?? orgId.value,
        source: "auth-store",
      });

      return;
    }

    setContext({
      token: null,
      orgId: null,
      source: "none",
    });
  }

  return {
    token,
    orgId,
    source,
    refresh,
    clear,
    setContext,
    setOrgId,
    getAccessToken,
    getOrgId,
  };
}
