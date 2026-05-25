import { Clerk } from '@clerk/clerk-js';

export default defineNuxtPlugin(async () => {
  const runtimeConfig = useRuntimeConfig();
  const publishableKey = runtimeConfig.public.clerkPublishableKey;

  if (!publishableKey) {
    if (import.meta.dev) {
      console.warn(
        '[clerk] NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY no está definido. OAuth no estará disponible.',
      );
    }

    return;
  }

  try {
    const clerk = new Clerk(publishableKey);
    // Route Clerk session tasks (e.g. the forced "choose organization" step) to
    // our own custom pages instead of the hosted accounts.dev portal, so the
    // whole auth journey keeps the FreakDays look & feel.
    await clerk.load({
      taskUrls: {
        'choose-organization': '/session-tasks/choose-organization',
      },
    });
    window.Clerk = clerk;
  } catch (error) {
    if (import.meta.dev) {
      console.warn(
        '[clerk] Error inicializando Clerk en cliente. Verificá NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY y reiniciá el dev server.',
        error,
      );
    }
  }
});
