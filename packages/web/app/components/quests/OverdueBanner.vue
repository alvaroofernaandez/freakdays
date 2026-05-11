<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'

interface Props {
  count: number
}

defineProps<Props>()
</script>

<template>
  <div v-if="count > 0" class="p-3 sm:p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
    <div class="flex items-start gap-3">
      <AlertCircle class="h-5 w-5 text-destructive shrink-0 mt-0.5" />
      <div class="flex-1">
        <h3 class="text-sm font-semibold text-destructive mb-1">Misiones Atrasadas</h3>
        <p class="text-xs text-muted-foreground">
          Tienes {{ count }} {{ count === 1 ? 'misión' : 'misiones' }} atrasada{{ count === 1 ? '' : 's' }}
        </p>
      </div>
    </div>
  </div>
</template>

