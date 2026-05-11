<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  title?: string
  description?: string
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <div :class="cn('flex flex-col items-center justify-center p-8 text-center', props.class)" style="pointer-events: none;">
    <slot name="icon">
      <div class="mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
        <slot name="default-icon" />
      </div>
    </slot>
    <h3 v-if="title || $slots.title" class="mb-2 text-lg font-semibold">
      <slot name="title">{{ title }}</slot>
    </h3>
    <p v-if="description || $slots.description" class="text-sm text-muted-foreground max-w-sm">
      <slot name="description">{{ description }}</slot>
    </p>
    <div v-if="$slots.action" class="mt-4" style="pointer-events: auto;">
      <slot name="action" />
    </div>
  </div>
</template>

