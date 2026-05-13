import { useAuthStore } from '~~/stores/auth';
import { useModulesStore } from '~~/stores/modules';
import { useOrganizationContext } from '@/composables/useOrganizationContext';

type OAuthProvider = 'google' | 'github' | 'discord';
type ClerkOAuthStrategy = 'oauth_google' | 'oauth_github' | 'oauth_discord';

interface ClerkOAuthRedirectOptions {
  strategy: ClerkOAuthStrategy;
  redirectUrl?: string;
}

interface ClerkOAuthBridge {
  redirectToSignIn?: (options?: ClerkOAuthRedirectOptions) => Promise<unknown> | unknown;
}

const CLERK_OAUTH_STRATEGY_MAP: Record<OAuthProvider, ClerkOAuthStrategy> = {
  google: 'oauth_google',
  github: 'oauth_github',
  discord: 'oauth_discord',
};

const OAUTH_PROVIDER_LABELS: Record<OAuthProvider, string> = {
  google: 'Google',
  github: 'GitHub',
  discord: 'Discord',
};

export function useAuth() {
  const authContext = useAuthContext();
  const authStore = useAuthStore();
  const modulesStore = useModulesStore();
  const organizationContext = useOrganizationContext();
  const router = useRouter();
  const LEGACY_AUTH_MESSAGE = 'Auth legacy email/password fue removido. Usá Clerk para continuar.';

  async function initialize() {
    authStore.setLoading(true);
    try {
      await authContext.refresh();
      authStore.setSession(null);
    } catch (_err) {
      authStore.setError('Error initializing auth');
    } finally {
      authStore.setLoading(false);
    }
  }

  async function ensureProfileExists(userId: string, email: string) {
    void userId;
    void email;
    throw new Error('ensureProfileExists legacy no soportado en runtime Clerk-only.');
  }

  async function signUp(email: string, password: string) {
    authStore.setLoading(true);
    authStore.setError(null);

    try {
      void email;
      void password;
      authStore.setError(LEGACY_AUTH_MESSAGE);
      return { success: false, error: LEGACY_AUTH_MESSAGE };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error signing up';
      authStore.setError(message);
      return { success: false, error: message };
    } finally {
      authStore.setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    authStore.setLoading(true);
    authStore.setError(null);

    try {
      void email;
      void password;
      authStore.setError(LEGACY_AUTH_MESSAGE);
      return { success: false, error: LEGACY_AUTH_MESSAGE };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error signing in';
      authStore.setError(message);
      return { success: false, error: message };
    } finally {
      authStore.setLoading(false);
    }
  }

  async function signOut() {
    authStore.setLoading(true);
    try {
      authStore.reset();
      modulesStore.reset();
      authContext.clear();
      organizationContext.clearActiveOrgId();
      router.push('/login');
    } catch (_err) {
      authStore.setError('Error signing out');
    } finally {
      authStore.setLoading(false);
    }
  }

  async function _createProfile(userId: string, email: string) {
    void userId;
    void email;
    throw new Error('createProfile legacy no soportado en runtime Clerk-only.');
  }

  async function signInWithGoogle() {
    return signInWithOAuthProvider('google');
  }

  async function signInWithGitHub() {
    return signInWithOAuthProvider('github');
  }

  async function signInWithDiscord() {
    return signInWithOAuthProvider('discord');
  }

  async function attemptClerkOAuthBridge(provider: OAuthProvider): Promise<boolean> {
    if (!import.meta.client) {
      return false;
    }

    const maybeClerk = window.Clerk;

    if (!maybeClerk || typeof maybeClerk !== 'object') {
      return false;
    }

    const clerk = maybeClerk as ClerkOAuthBridge;

    if (typeof clerk.redirectToSignIn !== 'function') {
      return false;
    }

    await clerk.redirectToSignIn({
      strategy: CLERK_OAUTH_STRATEGY_MAP[provider],
      redirectUrl: `${window.location.origin}/`,
    });

    return true;
  }

  async function signInWithOAuthProvider(provider: OAuthProvider) {
    authStore.setLoading(true);
    authStore.setError(null);

    try {
      let clerkBridgeHandled = false;

      try {
        clerkBridgeHandled = await attemptClerkOAuthBridge(provider);
      } catch {
        clerkBridgeHandled = false;
      }

      if (!clerkBridgeHandled) {
        throw new Error(
          'Clerk bridge no disponible. Configurá NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY y verificá inicialización de Clerk para OAuth.',
        );
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : `Error al iniciar sesión con ${OAUTH_PROVIDER_LABELS[provider]}`;
      authStore.setError(message);
    } finally {
      authStore.setLoading(false);
    }
  }

  return {
    initialize,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    signInWithGitHub,
    signInWithDiscord,
    ensureProfileExists,
  };
}
