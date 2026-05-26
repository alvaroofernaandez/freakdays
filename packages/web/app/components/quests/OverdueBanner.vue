<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next';

interface Props {
  count: number;
}

defineProps<Props>();
</script>

<template>
  <div
    v-if="count > 0"
    class="p-3 sm:p-4 border-2 border-destructive/50 bg-destructive/10 rounded-none"
    role="alert"
  >
    <div class="flex items-start gap-3">
      <AlertCircle class="h-5 w-5 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
      <div class="flex-1">
        <p class="font-pixel text-[9px] text-destructive uppercase mb-1">▸ MISIONES ATRASADAS</p>
        <p class="text-sm text-muted-foreground">
          Tienes {{ count }} {{ count === 1 ? 'misión' : 'misiones' }} atrasada{{
            count === 1 ? '' : 's'
          }}
        </p>
      </div>
    </div>
  </div>
</template>
