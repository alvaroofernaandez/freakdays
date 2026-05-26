<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { Check } from 'lucide-vue-next';
import { getModuleIcon } from '~~/domain/constants/module-icons';
import type { AppModule, ModuleId } from '~~/domain/types';
import { useModulesStore } from '~~/stores/modules';

interface Props {
  module: AppModule;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  toggle: [id: ModuleId];
}>();

const modulesStore = useModulesStore();
const { moduleMap, synced } = storeToRefs(modulesStore);

// Directly access moduleMap.value to ensure reactivity; touch `synced` so the
// computed re-runs once modules finish loading from the API.
const isEnabled = computed(() => {
  const moduleId = props.module.id;
  const _sync = synced.value;
  return Boolean(moduleMap.value[moduleId]);
});

// Pixel-clipped corners — mirrors the onboarding module icon frame.
const ICON_CLIP =
  'polygon(0 4px,4px 4px,4px 0,calc(100% - 4px) 0,calc(100% - 4px) 4px,100% 4px,100% calc(100% - 4px),calc(100% - 4px) calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,4px calc(100% - 4px),0 calc(100% - 4px))';
</script>

<template>
  <button
    type="button"
    class="group w-full text-left rounded-none border-2 p-4 flex items-center gap-4 transition-colors cursor-pointer active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
    :class="
      isEnabled
        ? 'border-primary bg-primary/10 shadow-[0_0_22px_-8px_var(--color-primary)]'
        : 'border-border/60 bg-card/40 hover:border-primary/50'
    "
    role="switch"
    :aria-checked="isEnabled"
    :aria-label="`${isEnabled ? 'Desactivar' : 'Activar'} módulo ${module.name}`"
    @click="emit('toggle', module.id)"
  >
    <div
      class="pixelated grid place-items-center w-12 h-12 shrink-0 transition-colors"
      :class="isEnabled ? 'bg-primary text-primary-foreground' : 'bg-primary/15 text-primary'"
      :style="{ clipPath: ICON_CLIP }"
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
        isEnabled
          ? 'bg-primary border-primary text-primary-foreground'
          : 'border-muted-foreground/40 bg-background/40'
      "
      aria-hidden="true"
    >
      <Check v-if="isEnabled" class="h-4 w-4" />
    </div>
  </button>
</template>
