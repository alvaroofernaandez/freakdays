<script setup lang="ts">
import type { AppModule } from '~~/domain/types'
import ModuleCard from './ModuleCard.vue'

interface Props {
  modules: AppModule[]
}

defineProps<Props>()
</script>

<template>
  <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
    <NuxtLink
      v-for="module in modules" 
      :key="module.id"
      :to="`/${module.id}`"
      class="group block transition-transform hover:scale-[1.02] active:scale-[0.98]"
    >
      <ModuleCard :module="module" />
    </NuxtLink>
  </div>
</template>

