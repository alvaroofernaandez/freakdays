<script setup lang="ts">
import { PopoverTrigger as RadixPopoverTrigger } from 'reka-ui';

defineProps<{
  asChild?: boolean;
}>();
</script>

<template>
  <RadixPopoverTrigger :as-child="asChild">
    <slot />
  </RadixPopoverTrigger>
</template>
