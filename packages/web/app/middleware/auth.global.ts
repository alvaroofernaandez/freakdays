import { useAuthStore } from "../../stores/auth";
import { useModulesStore } from "../../stores/modules";

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    return;
  }

  const user = useSupabaseUser();
  const authStore = useAuthStore();
  const modulesStore = useModulesStore();
  const supabase = useSupabase();

  const publicRoutes = ["/login", "/register"];
  const isPublicRoute = publicRoutes.includes(to.path);
  const isOnboardingRoute = to.path === "/onboarding";

  // Sync Supabase user with Auth Store
  if (user.value) {
    if (!authStore.session) {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
          authStore.reset();
          return;
        }
        const { data: sessionData } = await supabase.auth.getSession();
        authStore.setSession(sessionData.session);
      } catch (error) {
        console.error("Error syncing auth:", error);
        authStore.reset();
      }
    }
  } else {
    // No user, clear store if it has data
    if (authStore.session) {
      authStore.reset();
    }
  }

  // Redirect if not authenticated and trying to access protected route
  if (!user.value && !isPublicRoute) {
    return navigateTo("/login");
  }

  // Check onboarding status for authenticated users (only if not already on onboarding)
  // Always load modules if not synced OR if synced but no enabled modules (page refresh scenario)
  if (user.value && !isOnboardingRoute) {
    const needsLoad = !modulesStore.synced || 
                      (modulesStore.synced && modulesStore.enabledModules.length === 0 && modulesStore.modules.length > 0);
    
    if (needsLoad) {
      try {
        if (!user.value.id) {
          modulesStore.synced = true;
          return;
        }

        const { data, error } = await supabase
          .from("user_modules")
          .select("module_id, enabled")
          .eq("user_id", user.value.id);

        if (error) {
          console.error("Error loading modules:", error);
          modulesStore.synced = true;
          return;
        }

        if (data && data.length > 0) {
          modulesStore.setModulesFromDb(data);
        } else {
          modulesStore.synced = true;
        }
      } catch (error) {
        console.error("Error loading modules:", error);
        modulesStore.synced = true;
      }
    }
  }

  // Redirect if authenticated and trying to access public route
  if (user.value && isPublicRoute) {
    if (modulesStore.synced && !modulesStore.hasCompletedOnboarding) {
      return navigateTo("/onboarding");
    }
    if (modulesStore.hasCompletedOnboarding) {
      return navigateTo("/");
    }
    return;
  }

  // Redirect to onboarding if not completed and trying to access protected route
  // Only redirect if we're not already on the onboarding route and we've synced
  if (
    user.value &&
    !isOnboardingRoute &&
    !isPublicRoute &&
    modulesStore.synced &&
    !modulesStore.hasCompletedOnboarding
  ) {
    return navigateTo("/onboarding");
  }
});
