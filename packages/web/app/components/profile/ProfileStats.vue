<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Sparkles, Target, Trophy } from 'lucide-vue-next'

interface Props {
  level: number
  totalExp: number
  currentExp: number
  neededExp: number
}

const props = defineProps<Props>()

const progress = computed(() => {
  if (props.neededExp === 0) return 100
  return Math.min(100, (props.currentExp / props.neededExp) * 100)
})
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
    <Card class="relative overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
      <div class="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <CardContent class="relative p-6 text-center">
        <div class="flex flex-col items-center gap-2">
          <div class="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Sparkles class="h-6 w-6 text-primary" />
          </div>
          <span class="text-3xl font-bold text-primary">{{ level }}</span>
          <span class="text-xs text-muted-foreground font-medium">Nivel</span>
        </div>
      </CardContent>
    </Card>
    <Card class="relative overflow-hidden border-exp-medium/20 bg-linear-to-br from-exp-medium/5 to-transparent">
      <div class="absolute top-0 right-0 w-32 h-32 bg-exp-medium/10 rounded-full blur-3xl" />
      <CardContent class="relative p-6 text-center">
        <div class="flex flex-col items-center gap-2">
          <div class="w-12 h-12 rounded-xl bg-exp-medium/20 flex items-center justify-center">
            <Trophy class="h-6 w-6 text-exp-medium" />
          </div>
          <span class="text-3xl font-bold text-exp-medium">{{ totalExp }}</span>
          <span class="text-xs text-muted-foreground font-medium">EXP Total</span>
        </div>
      </CardContent>
    </Card>
    <Card class="relative overflow-hidden border-accent/20 bg-linear-to-br from-accent/5 to-transparent">
      <div class="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
      <CardContent class="relative p-6 text-center">
        <div class="flex flex-col items-center gap-2">
          <div class="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <Target class="h-6 w-6 text-accent" />
          </div>
          <span class="text-3xl font-bold text-accent">{{ currentExp }}</span>
          <span class="text-xs text-muted-foreground font-medium">EXP Nivel</span>
        </div>
      </CardContent>
    </Card>
    <Card class="relative overflow-hidden border-exp-easy/20 bg-linear-to-br from-exp-easy/5 to-transparent">
      <div class="absolute top-0 right-0 w-32 h-32 bg-exp-easy/10 rounded-full blur-3xl" />
      <CardContent class="relative p-6 text-center">
        <div class="flex flex-col items-center gap-2">
          <div class="w-12 h-12 rounded-xl bg-exp-easy/20 flex items-center justify-center">
            <Calendar class="h-6 w-6 text-exp-easy" />
          </div>
          <span class="text-3xl font-bold text-exp-easy">{{ neededExp - currentExp }}</span>
          <span class="text-xs text-muted-foreground font-medium">Para subir</span>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

