<script setup lang="ts">
interface Props {
  password: string
  strength: number
  label: string
  color: string
}

const props = defineProps<Props>()
</script>

<template>
  <div v-if="props.password" class="space-y-2">
    <div class="flex gap-1 h-1.5">
      <div 
        v-for="i in 4" 
        :key="i"
        class="flex-1 rounded-full transition-all duration-300"
        :class="i <= props.strength ? props.color : 'bg-muted'"
      />
    </div>
    <div class="flex justify-between items-center text-xs">
      <span class="text-muted-foreground">Fuerza:</span>
      <span :class="props.strength >= 3 ? 'text-exp-easy' : props.strength >= 2 ? 'text-exp-medium' : 'text-destructive'">
        {{ props.label }}
      </span>
    </div>
  </div>
</template>

