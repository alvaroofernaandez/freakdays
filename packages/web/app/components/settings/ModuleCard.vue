<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { getModuleIcon } from '~~/domain/constants/module-icons'
import type { AppModule, ModuleId } from '~~/domain/types'
import { useModulesStore } from '~~/stores/modules'

interface Props {
  module: AppModule
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggle: [id: ModuleId]
}>()

const modulesStore = useModulesStore()
const { moduleMap, synced } = storeToRefs(modulesStore)

// Directly access moduleMap.value to ensure reactivity
const isEnabled = computed(() => {
  const moduleId = props.module.id
  // Access synced to force reactivity update when modules are loaded
  const _sync = synced.value
  // Directly access moduleMap.value to ensure reactivity
  const enabled = moduleMap.value[moduleId]
  // Return strict boolean
  return Boolean(enabled)
})
</script>

<template>
  <Card class="transition-all hover:border-primary/30" :class="isEnabled ? 'border-primary/50 bg-primary/5' : ''">
    <CardHeader class="flex flex-row items-center justify-between py-3 px-4">
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <component :is="getModuleIcon(module.icon)" class="h-5 w-5 text-primary" />
        </div>
        <div class="flex-1 min-w-0">
          <CardTitle class="text-sm font-medium">{{ module.name }}</CardTitle>
          <CardDescription class="text-xs truncate">{{ module.description }}</CardDescription>
        </div>
      </div>
      <Switch :checked="isEnabled"
        @update:checked="(checked) => { if (checked !== isEnabled) emit('toggle', module.id) }" />
    </CardHeader>
  </Card>
</template>
