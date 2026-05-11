<script setup lang="ts">
import { Dumbbell, Eye, Trash2 } from 'lucide-vue-next'
import type { Workout } from '@/composables/useWorkouts'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type ReadonlyWorkout = {
  readonly id: string
  readonly name: string
  readonly description: string | null
  readonly workoutDate: Date
  readonly durationMinutes: number | null
  readonly notes: string | null
  readonly status: 'in_progress' | 'completed'
  readonly startedAt: Date | null
  readonly completedAt: Date | null
  readonly exercises: readonly {
    readonly id: string
    readonly exerciseName: string
    readonly notes: string | null
    readonly orderIndex: number
    readonly sets: readonly {
      readonly id: string
      readonly setNumber: number
      readonly reps: number | null
      readonly weightKg: number | null
      readonly restSeconds: number | null
      readonly notes: string | null
    }[]
  }[]
}

interface Props {
  workout: Workout | ReadonlyWorkout
}

const props = defineProps<Props>()

const emit = defineEmits<{
  view: [id: string]
  delete: [id: string]
}>()

function formatDate(date: Date) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) return 'Hoy'
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer'
  return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatDuration(minutes: number | null) {
  if (!minutes) return '0 min'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
}

function handleViewClick(event: MouseEvent) {
  event.stopPropagation()
  event.preventDefault()
  emit('view', props.workout.id)
}

function handleDeleteClick(event: MouseEvent) {
  event.stopPropagation()
  event.preventDefault()
  emit('delete', props.workout.id)
}
</script>

<template>
  <Card class="hover:border-primary/30 transition-all group">
    <CardHeader class="flex flex-row items-center gap-3 py-3 sm:py-4 px-3 sm:px-4">
      <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Dumbbell class="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
      </div>
      <div class="flex-1 min-w-0">
        <CardTitle class="text-sm sm:text-base font-medium truncate">
          {{ workout.name }}
        </CardTitle>
        <CardDescription class="text-xs sm:text-sm mt-0.5 flex items-center gap-2 flex-wrap">
          <span>{{ workout.exercises.length }} {{ workout.exercises.length === 1 ? 'ejercicio' : 'ejercicios' }}</span>
          <span class="text-muted-foreground/50">·</span>
          <span>{{ formatDuration(workout.durationMinutes) }}</span>
        </CardDescription>
      </div>
      <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors touch-manipulation"
          @click="handleViewClick"
          aria-label="Ver detalles del entrenamiento"
        >
          <Eye class="h-4 w-4" />
        </Button>
        <Badge variant="outline" class="text-[10px] sm:text-xs hidden sm:inline-flex px-2 py-0.5">
          {{ formatDate(workout.workoutDate) }}
        </Badge>
        <span class="text-[10px] sm:text-xs text-muted-foreground sm:hidden px-1">
          {{ formatDate(workout.workoutDate) }}
        </span>
        <Button 
          variant="ghost" 
          size="icon" 
          class="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors touch-manipulation"
          @click="handleDeleteClick"
          aria-label="Eliminar entrenamiento"
        >
          <Trash2 class="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  </Card>
</template>

