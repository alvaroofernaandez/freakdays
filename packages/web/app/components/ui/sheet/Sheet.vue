<script setup lang="ts">
import { DialogRoot } from 'radix-vue';

interface Props {
  open?: boolean
  defaultOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()
</script>

<template>
  <DialogRoot :open="open" :default-open="defaultOpen" @update:open="emit('update:open', $event)">
    <slot />
  </DialogRoot>
</template>
