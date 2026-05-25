<script setup lang="ts">
import {
  AlertCircle,
  Eye,
  EyeOff,
  Flame,
  Hexagon,
  Lock,
  Mail,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Zap,
} from 'lucide-vue-next';
import { useAuthStore } from '~~/stores/auth';

definePageMeta({
  layout: false,
});

const auth = useAuth();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const capsLockOn = ref(false);

// Decorative HUD XP bar — fills in on mount (skipped visually under
// prefers-reduced-motion since the transition is gated with motion-safe).
const xpFill = ref(0);
onMounted(() => {
  requestAnimationFrame(() => {
    xpFill.value = 72;
  });
});

const canSubmit = computed(
  () => email.value.trim().length > 0 && password.value.length > 0 && !authStore.loading,
);

// Clear a stale server error as soon as the user edits a field, so the message
// never lingers next to input the user has already corrected.
function clearError() {
  if (authStore.error) {
    authStore.setError(null);
  }
}

function syncCapsLock(event: KeyboardEvent) {
  capsLockOn.value = event.getModifierState?.('CapsLock') ?? false;
}

async function handleSubmit() {
  if (!canSubmit.value) return;
  const result = await auth.signIn(email.value.trim(), password.value);
  if (result.success) {
    await navigateTo('/');
  }
}

function handleGoogleSignIn() {
  if (authStore.loading) return;
  auth.signInWithGoogle();
}
</script>

<template>
  <div
    class="relative min-h-screen-safe animated-gradient-bg overflow-hidden lg:grid lg:grid-cols-2"
  >
    <!-- Global ambient background: orbs + HUD scanline grid -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div class="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div class="absolute bottom-24 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      <div
        class="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] bg-secondary/5 rounded-full blur-3xl"
      />
      <div
        class="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,var(--color-primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-primary)_1px,transparent_1px)] bg-[size:44px_44px]"
      />
    </div>

    <!-- ───────────── LEFT: immersive brand / HUD panel (desktop) ───────────── -->
    <aside
      class="crt-scanlines relative z-10 hidden lg:flex flex-col justify-between p-12 xl:p-16 border-r border-white/10 overflow-hidden"
      aria-hidden="true"
    >
      <!-- Floating pixel particles -->
      <div class="absolute inset-0 pointer-events-none">
        <span
          class="pixelated absolute top-[18%] left-[14%] h-2 w-2 bg-primary motion-safe:animate-pulse"
        />
        <span
          class="pixelated absolute top-[32%] right-[22%] h-1.5 w-1.5 bg-accent motion-safe:animate-pulse [animation-delay:300ms]"
        />
        <span
          class="pixelated absolute bottom-[28%] left-[28%] h-2.5 w-2.5 bg-secondary motion-safe:animate-pulse [animation-delay:700ms]"
        />
        <span
          class="pixelated absolute top-[60%] right-[16%] h-1.5 w-1.5 bg-primary motion-safe:animate-pulse [animation-delay:500ms]"
        />
        <span
          class="pixelated absolute top-[12%] right-[40%] h-1 w-1 bg-accent motion-safe:animate-pulse"
        />
      </div>

      <!-- HUD status strip: level badge + segmented XP bar -->
      <div class="relative flex items-center gap-3">
        <div
          class="pixelated grid h-10 w-9 place-items-center bg-linear-to-br from-primary to-accent [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]"
        >
          <span class="font-pixel text-[10px] text-white">1</span>
        </div>
        <div class="flex-1 max-w-xs">
          <div
            class="flex items-center justify-between font-pixel text-[8px] text-muted-foreground"
          >
            <span class="flex items-center gap-1.5"
              ><Hexagon class="h-3 w-3 text-primary" /> NIVEL 1</span
            >
            <span>0/1000 XP</span>
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

      <!-- Brand block -->
      <div class="relative space-y-6">
        <div
          class="pixelated inline-flex items-center justify-center w-24 h-24 bg-linear-to-br from-primary via-accent to-secondary p-[3px] shadow-[0_0_50px_-8px_var(--color-primary)] [clip-path:polygon(0_8px,8px_8px,8px_0,calc(100%-8px)_0,calc(100%-8px)_8px,100%_8px,100%_calc(100%-8px),calc(100%-8px)_calc(100%-8px),calc(100%-8px)_100%,8px_100%,8px_calc(100%-8px),0_calc(100%-8px))]"
        >
          <div
            class="w-full h-full bg-card flex items-center justify-center [clip-path:polygon(0_6px,6px_6px,6px_0,calc(100%-6px)_0,calc(100%-6px)_6px,100%_6px,100%_calc(100%-6px),calc(100%-6px)_calc(100%-6px),calc(100%-6px)_100%,6px_100%,6px_calc(100%-6px),0_calc(100%-6px))]"
          >
            <img src="/logo.png" alt="" class="h-20 w-20" />
          </div>
        </div>

        <div>
          <p class="text-5xl xl:text-6xl font-logo text-gradient tracking-[0.06em]">FREAKDAYS</p>
          <p class="flex items-center gap-2 mt-3 text-muted-foreground text-base">
            <Sparkles class="h-5 w-5 text-accent" />
            Tu vida, gamificada
            <Zap class="h-5 w-5 text-secondary" />
          </p>
        </div>

        <p class="max-w-md text-muted-foreground/80 leading-relaxed">
          Convierte tus hábitos, anime, manga y entrenamientos en una aventura: gana XP, sube de
          nivel y desbloquea logros cada día.
        </p>
      </div>

      <!-- Gamification stat chips -->
      <ul class="relative flex flex-wrap gap-3">
        <li class="pixel-frame bg-card/70 ring-1 ring-white/10 px-4 py-3 flex items-center gap-2.5">
          <Flame class="h-4 w-4 text-exp-medium" />
          <span class="font-pixel text-[10px] text-foreground">7</span>
          <span class="text-xs text-muted-foreground">días de racha</span>
        </li>
        <li class="pixel-frame bg-card/70 ring-1 ring-white/10 px-4 py-3 flex items-center gap-2.5">
          <Trophy class="h-4 w-4 text-exp-easy" />
          <span class="font-pixel text-[10px] text-foreground">24</span>
          <span class="text-xs text-muted-foreground">logros</span>
        </li>
        <li class="pixel-frame bg-card/70 ring-1 ring-white/10 px-4 py-3 flex items-center gap-2.5">
          <Target class="h-4 w-4 text-primary" />
          <span class="font-pixel text-[10px] text-foreground">5</span>
          <span class="text-xs text-muted-foreground">misiones</span>
        </li>
      </ul>
    </aside>

    <!-- ───────────── RIGHT: form panel ───────────── -->
    <main
      class="relative z-10 flex min-h-screen-safe items-center justify-center p-6 sm:p-10 lg:bg-background/30 lg:backdrop-blur-xl"
    >
      <div
        class="w-full max-w-sm space-y-7 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500"
      >
        <!-- Compact brand header (mobile only — desktop shows the left panel) -->
        <header class="lg:hidden text-center space-y-3">
          <div
            class="pixelated inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-primary via-accent to-secondary p-[3px] shadow-[0_0_30px_-6px_var(--color-primary)] [clip-path:polygon(0_6px,6px_6px,6px_0,calc(100%-6px)_0,calc(100%-6px)_6px,100%_6px,100%_calc(100%-6px),calc(100%-6px)_calc(100%-6px),calc(100%-6px)_100%,6px_100%,6px_calc(100%-6px),0_calc(100%-6px))]"
          >
            <div
              class="w-full h-full bg-card flex items-center justify-center [clip-path:polygon(0_5px,5px_5px,5px_0,calc(100%-5px)_0,calc(100%-5px)_5px,100%_5px,100%_calc(100%-5px),calc(100%-5px)_calc(100%-5px),calc(100%-5px)_100%,5px_100%,5px_calc(100%-5px),0_calc(100%-5px))]"
            >
              <img src="/logo.png" alt="" class="h-11 w-11" aria-hidden="true" />
            </div>
          </div>
          <p class="text-2xl font-logo text-gradient tracking-[0.06em]">FREAKDAYS</p>
          <div class="mx-auto max-w-[16rem]" aria-hidden="true">
            <div
              class="flex items-center justify-between font-pixel text-[8px] text-muted-foreground"
            >
              <span class="flex items-center gap-1.5"
                ><Hexagon class="h-3 w-3 text-primary" /> NIVEL 1</span
              >
              <span>0/1000 XP</span>
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
        </header>

        <div class="text-center lg:text-left">
          <h1 id="login-title" class="text-3xl font-bold text-foreground">Bienvenido de nuevo</h1>
          <p class="font-pixel text-[9px] text-muted-foreground/80 mt-2 leading-relaxed">
            CONTINÚA TU AVENTURA
          </p>
        </div>

        <section class="space-y-6" :aria-busy="authStore.loading" aria-labelledby="login-title">
          <Button
            type="button"
            variant="outline"
            class="btn-game w-full h-12 rounded-none text-base font-medium gap-3 cursor-pointer border-2 border-border/70 hover:border-primary/60"
            :disabled="authStore.loading"
            @click="handleGoogleSignIn"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar con Google
          </Button>

          <div class="flex items-center gap-4">
            <Separator class="flex-1" />
            <span class="font-pixel text-[8px] text-muted-foreground">O CON EMAIL</span>
            <Separator class="flex-1" />
          </div>

          <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
            <div class="space-y-2">
              <Label for="email" class="font-pixel text-[9px] text-muted-foreground">
                <span class="text-primary">▸</span> EMAIL
              </Label>
              <div class="relative group">
                <Mail
                  class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary"
                  aria-hidden="true"
                />
                <Input
                  id="email"
                  v-model="email"
                  type="email"
                  name="email"
                  placeholder="tu@email.com"
                  autocomplete="email"
                  inputmode="email"
                  autocapitalize="none"
                  spellcheck="false"
                  autofocus
                  :disabled="authStore.loading"
                  :aria-invalid="authStore.error ? true : undefined"
                  :aria-describedby="authStore.error ? 'login-error' : undefined"
                  class="w-full pl-11 h-12 rounded-none bg-background/50 border-2 border-border/50 focus:border-primary transition-all"
                  required
                  @input="clearError"
                />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="password" class="font-pixel text-[9px] text-muted-foreground">
                <span class="text-accent">▸</span> CONTRASEÑA
              </Label>
              <div class="relative group">
                <Lock
                  class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary"
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  name="password"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  :disabled="authStore.loading"
                  :aria-invalid="authStore.error ? true : undefined"
                  :aria-describedby="authStore.error ? 'login-error' : undefined"
                  class="w-full pl-11 pr-12 h-12 rounded-none bg-background/50 border-2 border-border/50 focus:border-primary transition-all"
                  required
                  @input="clearError"
                  @keyup="syncCapsLock"
                  @keydown="syncCapsLock"
                />
                <button
                  type="button"
                  :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  :aria-pressed="showPassword"
                  :disabled="authStore.loading"
                  class="btn-game absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-none text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  @click="showPassword = !showPassword"
                >
                  <Eye v-if="!showPassword" class="h-4 w-4" aria-hidden="true" />
                  <EyeOff v-else class="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <p
                v-if="capsLockOn"
                class="flex items-center gap-1.5 font-pixel text-[8px] text-exp-medium"
                role="status"
              >
                <AlertCircle class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                BLOQ MAYÚS ACTIVADO
              </p>
            </div>

            <Transition
              enter-active-class="motion-safe:transition motion-safe:duration-200"
              enter-from-class="opacity-0 motion-safe:-translate-y-1"
              leave-active-class="motion-safe:transition motion-safe:duration-150"
              leave-to-class="opacity-0"
            >
              <p
                v-if="authStore.error"
                id="login-error"
                role="alert"
                class="pixel-frame p-4 bg-destructive/15 ring-1 ring-destructive/30 text-destructive text-sm flex items-center gap-2"
              >
                <AlertCircle class="h-4 w-4 shrink-0" aria-hidden="true" />
                {{ authStore.error }}
              </p>
            </Transition>

            <Button
              type="submit"
              class="btn-game group w-full h-12 rounded-none font-pixel text-[11px] leading-relaxed bg-linear-to-r from-primary to-accent cursor-pointer disabled:cursor-not-allowed"
              :disabled="!canSubmit"
            >
              <span v-if="authStore.loading" class="flex items-center gap-2">
                <span
                  class="w-4 h-4 border-2 border-white/30 border-t-white animate-spin"
                  aria-hidden="true"
                />
                ENTRANDO…
              </span>
              <span v-else class="flex items-center gap-2.5">
                <Swords
                  class="h-4 w-4 motion-safe:transition-transform motion-safe:group-hover:rotate-12"
                  aria-hidden="true"
                />
                ENTRAR AL JUEGO
              </span>
            </Button>
          </form>

          <p class="text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?
            <NuxtLink
              to="/register"
              class="inline-block text-primary hover:text-accent font-semibold ml-1 px-1 transition-colors active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Regístrate
            </NuxtLink>
          </p>

          <p
            class="flex items-center justify-center gap-2 font-pixel text-[8px] text-muted-foreground/70"
          >
            <Trophy class="h-3.5 w-3.5 text-exp-easy" aria-hidden="true" />
            +1000 XP ESPERÁNDOTE
          </p>
        </section>
      </div>
    </main>
  </div>
</template>
