<script setup lang="ts">
import { AlertCircle, Check, Hexagon, Loader2, Sparkles, Swords, Zap } from 'lucide-vue-next';
import { useToast } from '~/composables/useToast';
import { getModuleIcon } from '~~/domain/constants/module-icons';
import type { ModuleId } from '~~/domain/types';
import { useAuthStore } from '~~/stores/auth';
import { useModulesStore } from '~~/stores/modules';

definePageMeta({
  layout: false,
});

const modulesStore = useModulesStore();
const authStore = useAuthStore();
const authContext = useAuthContext();
const router = useRouter();
const toast = useToast();

/**
 * Build the auth headers the NestJS API requires. Refresh first so the Clerk
 * JWT is fresh (they expire in ~60s) and the active org id is current.
 */
async function buildAuthHeaders(): Promise<Record<string, string>> {
  await authContext.refresh();
  const headers: Record<string, string> = {};
  const token = authContext.getAccessToken();
  const orgId = authContext.getOrgId();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (orgId) headers['x-org-id'] = orgId;
  return headers;
}

const selectedModules = ref<Set<ModuleId>>(new Set());
const saving = ref(false);
const error = ref<string | null>(null);

const selectedCount = computed(() => selectedModules.value.size);
const totalModules = computed(() => modulesStore.modules.length);
const allSelected = computed(
  () => totalModules.value > 0 && selectedCount.value === totalModules.value,
);
const canContinue = computed(() => selectedCount.value > 0 && !saving.value);

function isSelected(id: ModuleId): boolean {
  return selectedModules.value.has(id);
}

function toggleSelection(id: ModuleId) {
  // Reassign the Set so Vue reliably tracks the mutation.
  const next = new Set(selectedModules.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  selectedModules.value = next;
  if (error.value) error.value = null;
}

function toggleAll() {
  selectedModules.value = allSelected.value
    ? new Set()
    : new Set(modulesStore.modules.map((m) => m.id));
}

async function completeOnboarding() {
  if (!canContinue.value) return;

  if (!authStore.userId) {
    error.value = 'Tu sesión no está lista. Recarga la página e inténtalo de nuevo.';
    return;
  }

  error.value = null;
  saving.value = true;

  try {
    const headers = await buildAuthHeaders();

    if (!headers.Authorization) {
      error.value = 'Tu sesión expiró. Recarga la página e inténtalo de nuevo.';
      return;
    }

    modulesStore.enableModules([...selectedModules.value]);
    await modulesStore.syncToDatabase(headers);

    // Reconcile the store with the backend's persisted state.
    try {
      const data = await $fetch<Array<{ module_id: ModuleId; enabled: boolean }>>('/api/modules', {
        headers,
      });
      if (data && data.length > 0) {
        modulesStore.setModulesFromDb(data);
      }
    } catch (reloadError) {
      console.error('Error reloading modules after sync:', reloadError);
    }

    toast.success('¡Configuración guardada! Bienvenido a FreakDays');
    await router.push('/');
  } catch (err) {
    console.error('[onboarding] save failed:', err);
    error.value = 'No pudimos guardar tu configuración. Revisa tu conexión e inténtalo de nuevo.';
    toast.error('No se pudo guardar tu configuración');
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  // Pre-select whatever the user already had enabled (re-visits) so the step
  // reflects current state instead of resetting it.
  selectedModules.value = new Set(modulesStore.enabledModules.map((m) => m.id));
});
</script>

<template>
  <div
    class="relative h-screen-safe animated-gradient-bg overflow-hidden flex flex-col items-center"
  >
    <!-- Ambient background: orbs + HUD scanline grid + pixel particles -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div class="absolute top-16 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div class="absolute bottom-20 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] bg-secondary/5 rounded-full blur-3xl"
      />
      <div
        class="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,var(--color-primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-primary)_1px,transparent_1px)] bg-[size:44px_44px]"
      />
      <span
        class="pixelated absolute top-[14%] left-[12%] h-2 w-2 bg-primary motion-safe:animate-pulse"
      />
      <span
        class="pixelated absolute top-[24%] right-[14%] h-1.5 w-1.5 bg-accent motion-safe:animate-pulse [animation-delay:400ms]"
      />
      <span
        class="pixelated absolute bottom-[22%] left-[20%] h-2.5 w-2.5 bg-secondary motion-safe:animate-pulse [animation-delay:700ms]"
      />
    </div>

    <div
      class="crt-scanlines relative z-10 flex flex-col w-full max-w-3xl h-full px-5 sm:px-8 py-6"
    >
      <!-- Header -->
      <header class="text-center space-y-3 shrink-0">
        <div
          class="pixelated mx-auto inline-flex items-center justify-center w-14 h-14 bg-linear-to-br from-primary via-accent to-secondary p-[3px] shadow-[0_0_40px_-8px_var(--color-primary)] [clip-path:polygon(0_6px,6px_6px,6px_0,calc(100%-6px)_0,calc(100%-6px)_6px,100%_6px,100%_calc(100%-6px),calc(100%-6px)_calc(100%-6px),calc(100%-6px)_100%,6px_100%,6px_calc(100%-6px),0_calc(100%-6px))]"
        >
          <div
            class="w-full h-full bg-card grid place-items-center [clip-path:polygon(0_5px,5px_5px,5px_0,calc(100%-5px)_0,calc(100%-5px)_5px,100%_5px,100%_calc(100%-5px),calc(100%-5px)_calc(100%-5px),calc(100%-5px)_100%,5px_100%,5px_calc(100%-5px),0_calc(100%-5px))]"
          >
            <img src="/logo.png" alt="" class="h-8 w-8" aria-hidden="true" />
          </div>
        </div>

        <div class="space-y-1.5">
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Configura tu aventura
          </h1>
          <p
            class="flex items-center justify-center gap-2 font-pixel text-[9px] text-muted-foreground"
          >
            <Sparkles class="h-3 w-3 text-accent" aria-hidden="true" />
            ELIGE TUS MÓDULOS
            <Zap class="h-3 w-3 text-secondary" aria-hidden="true" />
          </p>
        </div>

        <!-- HUD segmented progress -->
        <div class="mx-auto max-w-sm" aria-hidden="true">
          <div
            class="flex items-center justify-between font-pixel text-[8px] text-muted-foreground mb-2"
          >
            <span class="flex items-center gap-1.5"
              ><Hexagon class="h-3 w-3 text-primary" /> MÓDULOS</span
            >
            <span class="tabular-nums">{{ selectedCount }} / {{ totalModules }}</span>
          </div>
          <div class="flex gap-1">
            <span
              v-for="i in totalModules"
              :key="i"
              class="h-2 flex-1 transition-colors duration-200"
              :class="i <= selectedCount ? 'bg-linear-to-r from-primary to-accent' : 'bg-white/10'"
            />
          </div>
        </div>
      </header>

      <!-- Select-all toggle -->
      <div class="flex items-center justify-end mt-6 mb-3 shrink-0">
        <button
          type="button"
          class="font-pixel text-[8px] text-muted-foreground hover:text-primary transition-colors cursor-pointer active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm px-1"
          :aria-pressed="allSelected"
          @click="toggleAll"
        >
          {{ allSelected ? 'QUITAR TODOS' : 'SELECCIONAR TODOS' }}
        </button>
      </div>

      <!-- Module list -->
      <div
        class="flex-1 min-h-0 overflow-y-auto scrollbar-hide -mx-1 px-1 grid grid-cols-1 md:grid-cols-2 gap-3 content-start"
        role="group"
        aria-label="Módulos disponibles"
      >
        <button
          v-for="(module, index) in modulesStore.modules"
          :key="module.id"
          type="button"
          class="group w-full text-left rounded-none border-2 p-4 flex items-center gap-4 transition-colors cursor-pointer active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2"
          :class="
            isSelected(module.id)
              ? 'border-primary bg-primary/10 shadow-[0_0_22px_-8px_var(--color-primary)]'
              : 'border-border/60 bg-card/40 hover:border-primary/50'
          "
          :style="{ animationDelay: `${Math.min(index * 50, 300)}ms` }"
          :aria-pressed="isSelected(module.id)"
          :aria-label="`${isSelected(module.id) ? 'Quitar' : 'Añadir'} módulo ${module.name}`"
          @click="toggleSelection(module.id)"
        >
          <div
            class="pixelated grid place-items-center w-12 h-12 shrink-0 transition-colors [clip-path:polygon(0_4px,4px_4px,4px_0,calc(100%-4px)_0,calc(100%-4px)_4px,100%_4px,100%_calc(100%-4px),calc(100%-4px)_calc(100%-4px),calc(100%-4px)_100%,4px_100%,4px_calc(100%-4px),0_calc(100%-4px))]"
            :class="
              isSelected(module.id)
                ? 'bg-primary text-primary-foreground'
                : 'bg-primary/15 text-primary'
            "
            aria-hidden="true"
          >
            <component :is="getModuleIcon(module.icon)" class="h-6 w-6" />
          </div>

          <div class="flex-1 min-w-0">
            <p class="font-semibold text-foreground">{{ module.name }}</p>
            <p class="text-sm text-muted-foreground leading-snug">{{ module.description }}</p>
          </div>

          <div
            class="shrink-0 grid place-items-center w-6 h-6 border-2 transition-colors"
            :class="
              isSelected(module.id)
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-muted-foreground/40 bg-background/40'
            "
            aria-hidden="true"
          >
            <Check v-if="isSelected(module.id)" class="h-4 w-4" />
          </div>
        </button>
      </div>

      <!-- Footer -->
      <footer class="shrink-0 pt-5 mt-4 border-t border-white/10 space-y-3">
        <Transition
          enter-active-class="motion-safe:transition motion-safe:duration-200"
          enter-from-class="opacity-0 motion-safe:-translate-y-1"
          leave-active-class="motion-safe:transition motion-safe:duration-150"
          leave-to-class="opacity-0"
        >
          <p
            v-if="error"
            role="alert"
            class="pixel-frame p-3 bg-destructive/15 ring-1 ring-destructive/30 text-destructive text-sm flex items-center gap-2"
          >
            <AlertCircle class="h-4 w-4 shrink-0" aria-hidden="true" />
            {{ error }}
          </p>
        </Transition>

        <p
          v-if="selectedCount === 0"
          class="flex items-center justify-center gap-2 font-pixel text-[8px] text-muted-foreground"
        >
          <Sparkles class="h-3 w-3" aria-hidden="true" />
          ELIGE AL MENOS UN MÓDULO
        </p>

        <Button
          class="btn-game group w-full h-12 rounded-none font-pixel text-[11px] leading-relaxed bg-linear-to-r from-primary to-accent cursor-pointer disabled:cursor-not-allowed"
          :disabled="!canContinue"
          :aria-busy="saving"
          @click="completeOnboarding"
        >
          <span v-if="saving" class="flex items-center gap-2">
            <Loader2 class="h-4 w-4 animate-spin" aria-hidden="true" />
            GUARDANDO…
          </span>
          <span v-else class="flex items-center gap-2.5">
            <Swords
              class="h-4 w-4 motion-safe:transition-transform motion-safe:group-hover:rotate-12"
              aria-hidden="true"
            />
            EMPEZAR AVENTURA
          </span>
        </Button>

        <p class="text-center text-xs text-muted-foreground/70">
          Podrás cambiarlo cuando quieras desde Configuración.
        </p>
      </footer>
    </div>
  </div>
</template>
