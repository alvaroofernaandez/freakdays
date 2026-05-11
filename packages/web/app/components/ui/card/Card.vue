<script setup lang="ts">
import { computed, useAttrs } from "vue"
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const attrs = useAttrs()
const otherAttrs = computed(() => {
  const { class: _, ...rest } = attrs
  return rest
})
</script>

<template>
  <div
    data-slot="card"
    :class="
      cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
        props.class,
      )
    "
    v-bind="otherAttrs"
  >
    <slot />
  </div>
</template>
