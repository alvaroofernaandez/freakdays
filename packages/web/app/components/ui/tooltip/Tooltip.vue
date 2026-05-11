<script setup lang="ts">
import { TooltipRoot, TooltipProvider } from 'radix-vue'
import type { HTMLAttributes } from 'vue'

interface Props {
  delayDuration?: number
  disableHoverableContent?: boolean
  open?: boolean
  defaultOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  delayDuration: 700,
  disableHoverableContent: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()
</script>

<template>
  <TooltipProvider :delay-duration="delayDuration">
    <TooltipRoot
      :open="open"
      :default-open="defaultOpen"
      :disable-hoverable-content="disableHoverableContent"
      @update:open="emit('update:open', $event)"
    >
      <slot />
    </TooltipRoot>
  </TooltipProvider>
</template>

