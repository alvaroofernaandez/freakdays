<script setup lang="ts">
import { cn } from '@/lib/utils'
import { computed, useAttrs } from 'vue'

const attrs = useAttrs()

const classes = computed(() => {
  return cn('animate-pulse rounded-md bg-muted', attrs.class as string | undefined)
})
</script>

<template>
  <div :class="classes" />
</template>

