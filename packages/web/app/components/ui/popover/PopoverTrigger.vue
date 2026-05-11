<script setup lang="ts">
import { PopoverTrigger as RadixPopoverTrigger } from 'radix-vue'

const props = defineProps<{
  asChild?: boolean
}>()
</script>

<template>
  <RadixPopoverTrigger :as-child="asChild">
    <slot />
  </RadixPopoverTrigger>
</template>

