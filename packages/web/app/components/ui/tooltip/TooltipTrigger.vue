<script setup lang="ts">
import { TooltipTrigger as RadixTooltipTrigger } from 'radix-vue'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  asChild?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  asChild: false,
})
</script>

<template>
  <RadixTooltipTrigger :as-child="asChild" :class="cn(props.class)">
    <slot />
  </RadixTooltipTrigger>
</template>

