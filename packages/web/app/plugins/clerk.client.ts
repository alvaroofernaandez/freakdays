import { Clerk } from "@clerk/clerk-js";

export default defineNuxtPlugin(async () => {
  const runtimeConfig = useRuntimeConfig();
  const publishableKey = runtimeConfig.public.clerkPublishableKey;

  if (!publishableKey) {
    if (import.meta.dev) {
      console.warn(
        "[clerk] NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY no está definido. OAuth no estará disponible."
      );
    }

    return;
  }

  try {
    const clerk = new Clerk(publishableKey);
    await clerk.load();
    window.Clerk = clerk;
  } catch (error) {
    if (import.meta.dev) {
      console.warn(
        "[clerk] Error inicializando Clerk en cliente. Verificá NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY y reiniciá el dev server.",
        error
      );
    }
  }
});
