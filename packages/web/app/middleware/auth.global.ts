/**
 * Global auth middleware — Clerk + NestJS API.
 *
 * Migrated from Supabase in S4 of the supabase→clerk+nestjs migration.
 * The Supabase-flavoured version called useSupabaseUser(), useSupabase(),
 * supabase.auth.getUser/getSession(), and supabase.from('user_modules').
 * All of that is now: useAuthContext().refresh() + window.Clerk.user +
 * $fetch('/api/modules').
 *
 * Behaviour preserved:
 * - Server-side: noop (return immediately).
 * - Public routes (/login, /register): skip auth gate.
 * - Authenticated + public route: redirect to /onboarding or /.
 * - Unauthenticated + protected route: redirect to /login.
 * - Modules loaded lazily once per session via the proxy endpoint.
 * - Onboarding redirect once modules are synced and onboarding isn't complete.
 */
import type { ModuleId } from '../../domain/types/modules';
import { useAuthStore } from '../../stores/auth';
import { useModulesStore } from '../../stores/modules';

interface ModulesPayloadRow {
  module_id: ModuleId;
  enabled: boolean;
}

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    return;
  }

  // The OAuth return route owns its own navigation: it finalizes the Clerk
  // session and redirects once `handleRedirectCallback` resolves. Gating it here
  // would either bounce the user away before the callback params are consumed or
  // redirect them to /login while the session is still being activated.
  if (to.path === '/sso-callback') {
    return;
  }

  // Clerk session-task pages (e.g. forced organization setup) own their own
  // navigation: the page resolves the pending task and then redirects. Gating
  // them here would bounce the user mid-task, since the session is still
  // "pending" until the task completes.
  if (to.path.startsWith('/session-tasks/')) {
    return;
  }

  const authContext = useAuthContext();
  const authStore = useAuthStore();
  const modulesStore = useModulesStore();

  await authContext.refresh();

  // Wait for Clerk to finish loading (up to 3 s) before reading .user.
  // Clerk sets window.Clerk.loaded once initialization is complete.
  if (window.Clerk && !(window.Clerk as unknown as Record<string, unknown>).loaded) {
    const start = Date.now();
    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        const loaded = (window.Clerk as unknown as Record<string, unknown>)?.loaded;
        if (loaded || Date.now() - start >= 3000) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  }

  const clerkUser = window.Clerk?.user ?? null;
  const isAuthenticated = clerkUser !== null && clerkUser !== undefined;

  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.includes(to.path);
  const isOnboardingRoute = to.path === '/onboarding';

  if (!isAuthenticated) {
    if (authStore.session) {
      authStore.reset();
    }

    if (!isPublicRoute) {
      return navigateTo('/login');
    }

    return;
  }

  // Lazy-load module preferences once.
  if (!isOnboardingRoute) {
    const needsLoad =
      !modulesStore.synced ||
      (modulesStore.synced &&
        modulesStore.enabledModules.length === 0 &&
        modulesStore.modules.length > 0);

    if (needsLoad) {
      try {
        const token = authContext.getAccessToken();
        const orgId = authContext.getOrgId();
        const headers: Record<string, string> = {};
        if (token) headers.authorization = `Bearer ${token}`;
        if (orgId) headers['x-org-id'] = orgId;
        const data = await $fetch<ModulesPayloadRow[]>('/api/modules', { headers });

        if (data && data.length > 0) {
          modulesStore.setModulesFromDb(data);
        } else {
          modulesStore.synced = true;
        }
      } catch (error) {
        console.error('Error loading modules:', error);
        modulesStore.synced = true;
      }
    }
  }

  // Authenticated user landing on /login or /register — bounce them home.
  if (isPublicRoute) {
    if (modulesStore.synced && !modulesStore.hasCompletedOnboarding) {
      return navigateTo('/onboarding');
    }

    if (modulesStore.hasCompletedOnboarding) {
      return navigateTo('/');
    }

    return;
  }

  // Authenticated, not on /onboarding, and modules say onboarding incomplete.
  if (!isOnboardingRoute && modulesStore.synced && !modulesStore.hasCompletedOnboarding) {
    return navigateTo('/onboarding');
  }
});
