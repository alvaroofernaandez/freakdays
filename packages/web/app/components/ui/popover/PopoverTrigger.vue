<script setup lang="ts">
import { PopoverTrigger as RadixPopoverTrigger } from 'radix-vue';

defineProps<{
  asChild?: boolean;
}>();
</script>

<template>
  <RadixPopoverTrigger :as-child="asChild">
    <slot />
  </RadixPopoverTrigger>
</template>
