<script setup lang="ts">
import { Activity, BarChart3, TrendingUp, Flame } from 'lucide-vue-next'
import type { WorkoutStats } from '@/utils/workout-calculations'
import { Card } from '@/components/ui/card'

interface Props {
  stats: WorkoutStats
}

defineProps<Props>()
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
    <Card class="p-3 sm:p-4 text-center">
      <div class="flex items-center justify-center mb-2">
        <Activity class="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
      </div>
      <div class="text-lg sm:text-2xl font-bold text-primary">{{ stats.totalExercises }}</div>
      <div class="text-[10px] sm:text-xs text-muted-foreground mt-1">Ejercicios</div>
    </Card>
    <Card class="p-3 sm:p-4 text-center">
      <div class="flex items-center justify-center mb-2">
        <BarChart3 class="h-4 w-4 sm:h-5 sm:w-5 text-exp-medium" />
      </div>
      <div class="text-lg sm:text-2xl font-bold text-exp-medium">{{ stats.totalSets }}</div>
      <div class="text-[10px] sm:text-xs text-muted-foreground mt-1">Series</div>
    </Card>
    <Card class="p-3 sm:p-4 text-center">
      <div class="flex items-center justify-center mb-2">
        <TrendingUp class="h-4 w-4 sm:h-5 sm:w-5 text-exp-hard" />
      </div>
      <div class="text-lg sm:text-2xl font-bold text-exp-hard">{{ stats.totalReps }}</div>
      <div class="text-[10px] sm:text-xs text-muted-foreground mt-1">Repeticiones</div>
    </Card>
    <Card class="p-3 sm:p-4 text-center">
      <div class="flex items-center justify-center mb-2">
        <Flame class="h-4 w-4 sm:h-5 sm:w-5 text-exp-legendary" />
      </div>
      <div class="text-lg sm:text-2xl font-bold text-exp-legendary">{{ stats.totalVolume.toFixed(1) }} kg</div>
      <div class="text-[10px] sm:text-xs text-muted-foreground mt-1">Volumen total</div>
    </Card>
  </div>
</template>

