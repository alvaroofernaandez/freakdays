<script setup lang="ts">
import { Check, ChevronRight, Loader2, Sparkles } from "lucide-vue-next";
import { useErrorHandler } from "~/composables/useErrorHandler";
import { useToast } from "~/composables/useToast";
import { getModuleIcon } from "~~/domain/constants/module-icons";
import type { ModuleId } from "~~/domain/types";
import { useAuthStore } from "~~/stores/auth";
import { useModulesStore } from "~~/stores/modules";

const modulesStore = useModulesStore();
const authStore = useAuthStore();
const supabase = useSupabase();
const router = useRouter();
const toast = useToast();
const errorHandler = useErrorHandler();

const selectedModules = ref<Set<ModuleId>>(new Set());
const saving = ref(false);
const error = ref<string | null>(null);
const focusedModuleId = ref<ModuleId | null>(null);

function toggleSelection(id: ModuleId) {
  if (selectedModules.value.has(id)) {
    selectedModules.value.delete(id);
  } else {
    selectedModules.value.add(id);
  }
  focusedModuleId.value = id;
}

function handleKeyDown(event: KeyboardEvent, moduleId: ModuleId) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    toggleSelection(moduleId);
  }
}

async function completeOnboarding() {
  if (!authStore.userId || saving.value) return;

  error.value = null;
  saving.value = true;

  try {
    modulesStore.enableModules([...selectedModules.value]);
    await modulesStore.syncToDatabase(supabase, authStore.userId);

    // Force reload modules from database to ensure consistency
    const { data, error: reloadError } = await supabase
      .from("user_modules")
      .select("module_id, enabled")
      .eq("user_id", authStore.userId);

    if (!reloadError && data && data.length > 0) {
      modulesStore.setModulesFromDb(data);
    }

    toast.success("¡Configuración guardada! Bienvenido a FreakDays");

    await new Promise((resolve) => setTimeout(resolve, 300));
    await router.push("/");
  } catch (err) {
    const errorMessage = errorHandler.getErrorMessage(err);
    error.value = errorMessage;
    toast.error("Error al guardar la configuración");
  } finally {
    saving.value = false;
  }
}

const canContinue = computed(
  () => selectedModules.value.size > 0 && !saving.value
);

const selectedCount = computed(() => selectedModules.value.size);
const totalModules = computed(() => modulesStore.modules.length);
const progressPercentage = computed(
  () => (selectedCount.value / totalModules.value) * 100
);

onMounted(() => {
  if (modulesStore.modules.length > 0) {
    const firstModule = modulesStore.modules[0];
    if (firstModule) {
      focusedModuleId.value = firstModule.id;
    }
  }
});
</script>


<template>
  <div class="min-h-screen-safe flex flex-col relative z-10">
    <div class="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 relative z-10">
      <header class="text-center space-y-4 mb-8 relative z-10" role="banner">
        <div
          class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2 animate-in fade-in slide-in-from-top-4 duration-500">
          <img src="/logo.png" alt="FreakDays" class="h-8 w-8 rounded-lg" width="32" height="32" />
        </div>
        <div class="space-y-2 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
          <h1 class="text-3xl sm:text-4xl font-bold tracking-tight">
            Configura tu Aventura
          </h1>
          <p class="text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
            Elige los módulos que quieres usar para personalizar tu experiencia
          </p>
        </div>
      </header>

      <div v-if="error"
        class="mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in fade-in slide-in-from-top-4 relative z-10"
        role="alert" aria-live="assertive">
        <p>{{ error }}</p>
      </div>

      <div class="flex-1 space-y-3 overflow-y-auto overflow-x-visible pb-4 -mx-4 px-4" role="main">
        <div v-for="(module, index) in modulesStore.modules" :key="module.id"
          class="animate-in fade-in slide-in-from-left-4 relative z-10 hover:z-50 py-3"
          :style="{ animationDelay: `${index * 50}ms` }">
          <button :id="`module-${module.id}`" type="button"
            class="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg transition-all relative"
            :aria-pressed="selectedModules.has(module.id)"
            :aria-label="`${selectedModules.has(module.id) ? 'Deseleccionar' : 'Seleccionar'} módulo ${module.name}`"
            :tabindex="0" @click="toggleSelection(module.id)" @keydown="handleKeyDown($event, module.id)">
            <Card :class="[
              'transition-all duration-300 ease-out cursor-pointer relative',
              'hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]',
              'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2',
              'origin-center',
              selectedModules.has(module.id)
                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-[1.01]'
                : 'hover:border-muted-foreground/50 border-border',
              focusedModuleId === module.id
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                : '',
            ]">
              <CardHeader class="flex flex-row items-center gap-4 py-5">
                <div :class="[
                  'w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300',
                  selectedModules.has(module.id)
                    ? 'bg-primary text-primary-foreground scale-110'
                    : 'bg-primary/10 text-primary',
                ]" :aria-hidden="true">
                  <component :is="getModuleIcon(module.icon)" class="h-7 w-7" />
                </div>
                <div class="flex-1 min-w-0">
                  <CardTitle class="text-lg font-semibold mb-1">
                    {{ module.name }}
                  </CardTitle>
                  <CardDescription class="text-sm leading-relaxed">
                    {{ module.description }}
                  </CardDescription>
                </div>
                <div :class="[
                  'shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300',
                  selectedModules.has(module.id)
                    ? 'bg-primary border-primary text-primary-foreground scale-110'
                    : 'border-muted-foreground/30 bg-background',
                ]" :aria-hidden="true">
                  <Check v-if="selectedModules.has(module.id)" class="h-4 w-4 animate-in zoom-in duration-200" />
                </div>
              </CardHeader>
            </Card>
          </button>
        </div>
      </div>

      <footer class="pt-6 space-y-4 border-t border-border mt-4 relative z-10" role="contentinfo">
        <div class="space-y-3">
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground font-medium">
              Progreso de selección
            </span>
            <Badge v-if="selectedCount > 0" variant="secondary" class="animate-in fade-in zoom-in duration-200">
              {{ selectedCount }} de {{ totalModules }}
            </Badge>
          </div>

          <div class="relative h-2 bg-muted rounded-full overflow-hidden">
            <div class="absolute inset-y-0 left-0 bg-primary transition-all duration-500 ease-out rounded-full"
              :style="{ width: `${progressPercentage}%` }" :aria-valuenow="progressPercentage" aria-valuemin="0"
              aria-valuemax="100" role="progressbar"
              :aria-label="`${selectedCount} de ${totalModules} módulos seleccionados`" />
          </div>
        </div>

        <div v-if="selectedCount === 0" class="text-center">
          <p class="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Sparkles class="h-4 w-4" />
            Selecciona al menos un módulo para continuar
          </p>
        </div>

        <Button size="lg" class="w-full h-14 text-base font-semibold relative overflow-hidden group"
          :disabled="!canContinue" :aria-busy="saving"
          :aria-label="saving ? 'Guardando configuración...' : 'Comenzar aventura'" @click="completeOnboarding">
          <span class="flex items-center justify-center gap-2 transition-transform duration-200"
            :class="saving ? 'opacity-0' : 'opacity-100'">
            <span>Comenzar Aventura</span>
            <ChevronRight class="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
          </span>
          <span v-if="saving" class="absolute inset-0 flex items-center justify-center gap-2">
            <Loader2 class="h-5 w-5 animate-spin" />
            <span>Guardando...</span>
          </span>
        </Button>

        <p class="text-center text-xs text-muted-foreground">
          Podrás cambiar esto en cualquier momento desde Configuración
        </p>
      </footer>
    </div>
  </div>
</template>
