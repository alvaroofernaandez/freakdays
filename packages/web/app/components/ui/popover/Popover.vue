<script setup lang="ts">
import { PopoverRoot } from 'radix-vue';

interface Props {
  open?: boolean;
  defaultOpen?: boolean;
}

withDefaults(defineProps<Props>(), {
  defaultOpen: false,
});

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();
</script>

<template>
  <PopoverRoot :open="open" :default-open="defaultOpen" @update:open="emit('update:open', $event)">
    <slot />
  </PopoverRoot>
</template>
