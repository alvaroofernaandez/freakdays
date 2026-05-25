import { useAuthStore } from '~~/stores/auth';
import { useModulesStore } from '~~/stores/modules';
import { useOrganizationContext } from '@/composables/useOrganizationContext';

type OAuthProvider = 'google' | 'github' | 'discord';
type ClerkOAuthStrategy = 'oauth_google' | 'oauth_github' | 'oauth_discord';

const CLERK_UNAVAILABLE_MESSAGE =
  'Clerk no está inicializado. Verifica NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY y reinicia el servidor de desarrollo.';

interface ClerkApiError {
  errors?: Array<{ longMessage?: string; message?: string }>;
}

/**
 * Clerk throws `ClerkAPIResponseError` instances whose user-facing copy lives in
 * `errors[].longMessage` (falling back to `message`). Pull that out so the form
 * can surface Clerk's own validation text instead of a generic string.
 */
function extractClerkErrorMessage(err: unknown): string | null {
  const apiError = err as ClerkApiError;
  const first = apiError?.errors?.[0];
  const message = first?.longMessage ?? first?.message;

  if (typeof message === 'string' && message.length > 0) {
    return message;
  }

  return err instanceof Error && err.message.length > 0 ? err.message : null;
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

  async function initialize() {
    authStore.setLoading(true);
    try {
      await authContext.refresh();
      authStore.setSession(null);
      if (import.meta.client) {
        authStore.setUser(window.Clerk?.user ?? null);
      }
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
      const clerk = import.meta.client ? window.Clerk : undefined;

      if (!clerk || !clerk.client) {
        authStore.setError(CLERK_UNAVAILABLE_MESSAGE);
        return { success: false as const, error: CLERK_UNAVAILABLE_MESSAGE };
      }

      const attempt = await clerk.client.signUp.create({
        emailAddress: email,
        password,
      });

      // Some Clerk instances don't require email verification — the account is
      // ready immediately.
      if (attempt.status === 'complete') {
        await clerk.setActive({ session: attempt.createdSessionId });
        authStore.setUser(clerk.user ?? null);
        await authContext.refresh();
        return { success: true as const, status: 'complete' as const };
      }

      // Otherwise Clerk needs to verify the email: send a one-time code and let
      // the caller collect it (custom flow — see verifyEmailCode).
      await clerk.client.signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      return { success: true as const, status: 'needs_verification' as const };
    } catch (err: unknown) {
      const message = extractClerkErrorMessage(err) ?? 'Error al crear la cuenta';
      authStore.setError(message);
      return { success: false as const, error: message };
    } finally {
      authStore.setLoading(false);
    }
  }

  async function verifyEmailCode(code: string) {
    authStore.setLoading(true);
    authStore.setError(null);

    try {
      const clerk = import.meta.client ? window.Clerk : undefined;

      if (!clerk || !clerk.client) {
        authStore.setError(CLERK_UNAVAILABLE_MESSAGE);
        return { success: false as const, error: CLERK_UNAVAILABLE_MESSAGE };
      }

      const attempt = await clerk.client.signUp.attemptEmailAddressVerification({ code });

      if (attempt.status === 'complete') {
        await clerk.setActive({ session: attempt.createdSessionId });
        authStore.setUser(clerk.user ?? null);
        await authContext.refresh();
        return { success: true as const };
      }

      const message = 'El código no es válido o el registro no se pudo completar.';
      authStore.setError(message);
      return { success: false as const, error: message };
    } catch (err: unknown) {
      const message = extractClerkErrorMessage(err) ?? 'Error al verificar el código';
      authStore.setError(message);
      return { success: false as const, error: message };
    } finally {
      authStore.setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    authStore.setLoading(true);
    authStore.setError(null);

    try {
      const clerk = import.meta.client ? window.Clerk : undefined;

      if (!clerk || !clerk.client) {
        authStore.setError(CLERK_UNAVAILABLE_MESSAGE);
        return { success: false, error: CLERK_UNAVAILABLE_MESSAGE };
      }

      const attempt = await clerk.client.signIn.create({
        identifier: email,
        password,
      });

      if (attempt.status === 'complete') {
        await clerk.setActive({ session: attempt.createdSessionId });
        authStore.setUser(clerk.user ?? null);
        await authContext.refresh();
        // Navigation is the caller's responsibility (the page), keeping this
        // composable free of route side effects and easy to unit test.
        return { success: true };
      }

      const message =
        'No se pudo completar el inicio de sesión. Verifica tus credenciales e inténtalo de nuevo.';
      authStore.setError(message);
      return { success: false, error: message };
    } catch (err: unknown) {
      const message = extractClerkErrorMessage(err) ?? 'Error al iniciar sesión';
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
      await router.push('/login');
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

  async function signInWithOAuthProvider(provider: OAuthProvider) {
    authStore.setLoading(true);
    authStore.setError(null);

    try {
      const clerk = import.meta.client ? window.Clerk : undefined;

      if (!clerk || !clerk.client) {
        authStore.setError(CLERK_UNAVAILABLE_MESSAGE);
        return;
      }

      // Custom-flow OAuth: Clerk redirects to the provider, then back to
      // /sso-callback, which finalizes the session and lands the user on `/`.
      await clerk.client.signIn.authenticateWithRedirect({
        strategy: CLERK_OAUTH_STRATEGY_MAP[provider],
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: `${window.location.origin}/`,
      });
    } catch (err: unknown) {
      const message =
        extractClerkErrorMessage(err) ??
        `Error al iniciar sesión con ${OAUTH_PROVIDER_LABELS[provider]}`;
      authStore.setError(message);
    } finally {
      // On a successful redirect the browser leaves this page before reaching
      // here; resetting loading only matters when the redirect itself failed.
      authStore.setLoading(false);
    }
  }

  return {
    initialize,
    signUp,
    verifyEmailCode,
    signIn,
    signOut,
    signInWithGoogle,
    signInWithGitHub,
    signInWithDiscord,
    ensureProfileExists,
  };
}
