<script setup lang="ts">
import { useAuthStore } from '~~/stores/auth';

definePageMeta({
  layout: false,
});

const authStore = useAuthStore();
const authContext = useAuthContext();
const failed = ref(false);
const errorMessage = ref<string | null>(null);

function extractClerkErrorMessage(err: unknown): string {
  const apiError = err as { errors?: Array<{ longMessage?: string; message?: string }> };
  const first = apiError?.errors?.[0];
  return (
    first?.longMessage ??
    first?.message ??
    (err instanceof Error ? err.message : 'Error desconocido al iniciar sesión.')
  );
}

onMounted(async () => {
  const clerk = window.Clerk;

  if (!clerk) {
    await navigateTo('/login');
    return;
  }

  try {
    // Finalize the OAuth redirect: Clerk consumes the callback params, activates
    // the session, then hands control to `customNavigate` (kept inside the SPA).
    await clerk.handleRedirectCallback(
      {
        signInFallbackRedirectUrl: '/',
        signUpFallbackRedirectUrl: '/',
      },
      async (to: string) => {
        // Clerk may hand us an absolute URL (e.g. the session-task page or a
        // Safari-ITP-decorated link). Nuxt's navigateTo rejects absolute URLs
        // unless told they're external, so branch on the protocol.
        if (/^https?:\/\//i.test(to)) {
          await navigateTo(to, { external: true });
        } else {
          await navigateTo(to);
        }
      },
    );

    authStore.setUser(clerk.user ?? null);
    await authContext.refresh();
  } catch (err: unknown) {
    // If the session actually got established despite the thrown error, don't
    // strand the user — route them on (respecting any pending Clerk task).
    if (clerk.user) {
      authStore.setUser(clerk.user);
      await authContext.refresh();
      await navigateTo(clerk.session?.currentTask ? '/session-tasks/choose-organization' : '/');
      return;
    }

    console.error('[sso-callback] handleRedirectCallback failed:', err);
    errorMessage.value = extractClerkErrorMessage(err);
    failed.value = true;
  }
});
</script>

<template>
  <div class="min-h-screen-safe flex items-center justify-center animated-gradient-bg p-4">
    <div
      class="glass rounded-3xl p-10 flex flex-col items-center gap-4 glow-border max-w-md text-center"
    >
      <template v-if="!failed">
        <div
          class="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"
        />
        <p class="text-muted-foreground text-sm">Completando inicio de sesión…</p>
      </template>
      <template v-else>
        <p class="font-pixel text-[11px] text-destructive">ERROR DE INICIO DE SESIÓN</p>
        <p class="text-destructive/90 text-sm break-words">{{ errorMessage }}</p>
        <NuxtLink
          to="/login"
          class="btn-game inline-flex h-10 items-center rounded-none px-4 font-pixel text-[10px] bg-linear-to-r from-primary to-accent cursor-pointer"
        >
          VOLVER AL LOGIN
        </NuxtLink>
      </template>
    </div>
  </div>
</template>
