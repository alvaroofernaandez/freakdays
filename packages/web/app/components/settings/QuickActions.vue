<script setup lang="ts">
import { Power, RefreshCw } from 'lucide-vue-next'

const emit = defineEmits<{
  disableAll: []
}>()
</script>

<template>
  <section class="space-y-3">
    <h2 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
      Acciones Rápidas
    </h2>
    
    <div class="grid grid-cols-2 gap-2">
      <Button 
        variant="outline"
        class="h-auto py-3 flex-col gap-1"
        @click="emit('disableAll')"
      >
        <Power class="h-4 w-4" />
        <span class="text-xs">Desactivar Todos</span>
      </Button>
      
      <Button 
        variant="outline"
        class="h-auto py-3 flex-col gap-1"
        as-child
      >
        <NuxtLink to="/onboarding">
          <RefreshCw class="h-4 w-4" />
          <span class="text-xs">Reconfigurar</span>
        </NuxtLink>
      </Button>
    </div>
  </section>
</template>

