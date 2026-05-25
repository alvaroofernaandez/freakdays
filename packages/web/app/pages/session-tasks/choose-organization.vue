<script setup lang="ts">
import { AlertCircle, ArrowRight, Hexagon, Sparkles, Tent, Zap } from 'lucide-vue-next';

definePageMeta({
  layout: false,
});

const orgName = ref('');
const submitting = ref(false);
const error = ref<string | null>(null);
const userEmail = ref<string | null>(null);

const xpFill = ref(0);

onMounted(async () => {
  const clerk = window.Clerk;

  if (!clerk || !clerk.user) {
    await navigateTo('/login');
    return;
  }

  // No pending "choose organization" task → the user has nothing to do here.
  if (!clerk.session?.currentTask) {
    await navigateTo('/');
    return;
  }

  userEmail.value = clerk.user.primaryEmailAddress?.emailAddress ?? null;
  const firstName = clerk.user.firstName;
  orgName.value = firstName ? `Espacio de ${firstName}` : 'Mi espacio FreakDays';

  requestAnimationFrame(() => {
    xpFill.value = 90;
  });
});

function extractError(err: unknown): string {
  const apiError = err as { errors?: Array<{ longMessage?: string; message?: string }> };
  const first = apiError?.errors?.[0];
  return (
    first?.longMessage ??
    first?.message ??
    (err instanceof Error ? err.message : 'No se pudo crear tu espacio. Inténtalo de nuevo.')
  );
}

async function handleSubmit() {
  const clerk = window.Clerk;
  const name = orgName.value.trim();

  if (!clerk || !name || submitting.value) return;

  submitting.value = true;
  error.value = null;

  try {
    const organization = await clerk.createOrganization({ name });
    // Activating the new organization resolves the pending session task.
    await clerk.setActive({ organization: organization.id });
    await navigateTo('/');
  } catch (err: unknown) {
    error.value = extractError(err);
  } finally {
    submitting.value = false;
  }
}

async function handleSignOut() {
  await window.Clerk?.signOut();
  await navigateTo('/login');
}
</script>

<template>
  <div
    class="relative min-h-screen-safe animated-gradient-bg overflow-hidden flex flex-col items-center justify-center p-4"
  >
    <!-- Ambient background: orbs + HUD scanline grid -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div class="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div class="absolute bottom-24 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[26rem] h-[26rem] bg-secondary/5 rounded-full blur-3xl"
      />
      <div
        class="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,var(--color-primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-primary)_1px,transparent_1px)] bg-[size:44px_44px]"
      />
      <span
        class="pixelated absolute top-[22%] left-[18%] h-2 w-2 bg-primary motion-safe:animate-pulse"
      />
      <span
        class="pixelated absolute bottom-[26%] right-[20%] h-1.5 w-1.5 bg-accent motion-safe:animate-pulse [animation-delay:400ms]"
      />
      <span
        class="pixelated absolute top-[30%] right-[26%] h-2.5 w-2.5 bg-secondary motion-safe:animate-pulse [animation-delay:700ms]"
      />
    </div>

    <main
      class="relative z-10 w-full max-w-md motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-500"
    >
      <section
        class="crt-scanlines glass glow-border relative rounded-3xl p-8 space-y-6"
        aria-labelledby="org-title"
      >
        <!-- HUD targeting brackets -->
        <span
          aria-hidden="true"
          class="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary/50 rounded-tl-lg"
        />
        <span
          aria-hidden="true"
          class="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-accent/50 rounded-tr-lg"
        />
        <span
          aria-hidden="true"
          class="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-accent/50 rounded-bl-lg"
        />
        <span
          aria-hidden="true"
          class="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-secondary/50 rounded-br-lg"
        />

        <!-- HUD status strip: final step -->
        <div class="relative flex items-center gap-3" aria-hidden="true">
          <div
            class="pixelated grid h-10 w-9 place-items-center bg-linear-to-br from-primary to-accent [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]"
          >
            <span class="font-pixel text-[10px] text-white">1</span>
          </div>
          <div class="flex-1">
            <div
              class="flex items-center justify-between font-pixel text-[8px] text-muted-foreground"
            >
              <span class="flex items-center gap-1.5"
                ><Hexagon class="h-3 w-3 text-primary" /> ÚLTIMO PASO</span
              >
              <span>CASI LISTO</span>
            </div>
            <div class="relative mt-2 h-3 bg-white/10 ring-1 ring-white/10 overflow-hidden">
              <div
                class="h-full bg-linear-to-r from-primary via-accent to-secondary motion-safe:transition-[width] motion-safe:duration-[1200ms] motion-safe:ease-out"
                :style="{ width: `${xpFill}%` }"
              />
              <div
                class="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_8px,var(--color-background)_8px_11px)]"
              />
            </div>
          </div>
        </div>

        <header class="text-center space-y-4">
          <div
            class="pixelated inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-primary via-accent to-secondary p-[3px] shadow-[0_0_40px_-8px_var(--color-primary)] [clip-path:polygon(0_7px,7px_7px,7px_0,calc(100%-7px)_0,calc(100%-7px)_7px,100%_7px,100%_calc(100%-7px),calc(100%-7px)_calc(100%-7px),calc(100%-7px)_100%,7px_100%,7px_calc(100%-7px),0_calc(100%-7px))]"
          >
            <div
              class="w-full h-full bg-card grid place-items-center [clip-path:polygon(0_5px,5px_5px,5px_0,calc(100%-5px)_0,calc(100%-5px)_5px,100%_5px,100%_calc(100%-5px),calc(100%-5px)_calc(100%-5px),calc(100%-5px)_100%,5px_100%,5px_calc(100%-5px),0_calc(100%-5px))]"
            >
              <Tent class="h-9 w-9 text-primary" aria-hidden="true" />
            </div>
          </div>

          <div>
            <h1 id="org-title" class="text-2xl font-bold text-foreground">Crea tu espacio</h1>
            <p
              class="flex items-center justify-center gap-2 mt-2 font-pixel text-[8px] text-muted-foreground"
            >
              <Sparkles class="h-3 w-3 text-accent" aria-hidden="true" />
              NOMBRA TU AVENTURA
              <Zap class="h-3 w-3 text-secondary" aria-hidden="true" />
            </p>
          </div>

          <p class="text-sm text-muted-foreground">
            Tu espacio es donde vivirán tus hábitos, quests y progreso. Puedes cambiar el nombre más
            tarde.
          </p>
        </header>

        <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
          <div class="space-y-2">
            <Label for="org-name" class="font-pixel text-[9px] text-muted-foreground">
              <span class="text-primary">▸</span> NOMBRE DEL ESPACIO
            </Label>
            <div class="relative group">
              <Tent
                class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary"
                aria-hidden="true"
              />
              <Input
                id="org-name"
                v-model="orgName"
                type="text"
                name="organization"
                placeholder="Mi espacio FreakDays"
                maxlength="50"
                autofocus
                :disabled="submitting"
                :aria-invalid="error ? true : undefined"
                :aria-describedby="error ? 'org-error' : undefined"
                class="w-full pl-11 h-12 rounded-none bg-background/50 border-2 border-border/50 focus:border-primary transition-all"
                required
                @input="error = null"
              />
            </div>
          </div>

          <Transition
            enter-active-class="motion-safe:transition motion-safe:duration-200"
            enter-from-class="opacity-0 motion-safe:-translate-y-1"
            leave-active-class="motion-safe:transition motion-safe:duration-150"
            leave-to-class="opacity-0"
          >
            <p
              v-if="error"
              id="org-error"
              role="alert"
              class="pixel-frame p-4 bg-destructive/15 ring-1 ring-destructive/30 text-destructive text-sm flex items-center gap-2"
            >
              <AlertCircle class="h-4 w-4 shrink-0" aria-hidden="true" />
              {{ error }}
            </p>
          </Transition>

          <Button
            type="submit"
            class="btn-game group w-full h-12 rounded-none font-pixel text-[11px] leading-relaxed bg-linear-to-r from-primary to-accent cursor-pointer disabled:cursor-not-allowed"
            :disabled="submitting || orgName.trim().length === 0"
          >
            <span v-if="submitting" class="flex items-center gap-2">
              <span
                class="w-4 h-4 border-2 border-white/30 border-t-white animate-spin"
                aria-hidden="true"
              />
              CREANDO…
            </span>
            <span v-else class="flex items-center gap-2.5">
              <ArrowRight
                class="h-4 w-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-1"
                aria-hidden="true"
              />
              EMPEZAR LA AVENTURA
            </span>
          </Button>
        </form>

        <p class="text-center text-xs text-muted-foreground">
          <span v-if="userEmail">Sesión iniciada como {{ userEmail }}. </span>
          <button
            type="button"
            class="inline-block text-primary hover:text-accent font-semibold px-1 transition-colors active:translate-y-px cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            @click="handleSignOut"
          >
            Cerrar sesión
          </button>
        </p>
      </section>
    </main>
  </div>
</template>
