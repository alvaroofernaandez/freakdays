<script setup lang="ts">
import type { AppModule, ModuleId } from '~~/domain/types';
import ModuleCard from './ModuleCard.vue';

interface Props {
  modules: AppModule[];
}

defineProps<Props>();

const emit = defineEmits<{
  toggle: [id: ModuleId];
}>();
</script>

<template>
  <section class="space-y-3">
    <h2 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Módulos</h2>

    <div class="space-y-2">
      <ModuleCard
        v-for="module in modules"
        :key="`module-${module.id}-${module.enabled}`"
        :module="module"
        @toggle="emit('toggle', $event)"
      />
    </div>
  </section>
</template>
