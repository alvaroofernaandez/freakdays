<script setup lang="ts">
import type { Workout } from '@/composables/useWorkouts'
import { Dumbbell, Plus } from 'lucide-vue-next'
import WorkoutCard from './WorkoutCard.vue'
import WorkoutCardSkeleton from './WorkoutCardSkeleton.vue'

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
  readonly exercises: readonly ReadonlyWorkoutExercise[]
}

type ReadonlyWorkoutExercise = {
  readonly id: string
  readonly exerciseName: string
  readonly notes: string | null
  readonly orderIndex: number
  readonly sets: readonly ReadonlyWorkoutSet[]
}

type ReadonlyWorkoutSet = {
  readonly id: string
  readonly setNumber: number
  readonly reps: number | null
  readonly weightKg: number | null
  readonly restSeconds: number | null
  readonly notes: string | null
}

interface Props {
  workouts: readonly ReadonlyWorkout[] | Workout[]
  loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  view: [id: string]
  delete: [id: string]
  add: []
}>()
</script>

<template>
  <section class="space-y-3">
    <h2 class="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider px-1">
      Historial Reciente
    </h2>

    <template v-if="loading">
      <WorkoutCardSkeleton v-for="i in 3" :key="i" />
    </template>

    <div v-else-if="workouts.length === 0" class="text-center py-12 sm:py-16">
      <div class="flex flex-col items-center gap-4">
        <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Dumbbell class="h-8 w-8 sm:h-10 sm:w-10 text-primary/50" />
        </div>
        <div class="space-y-2">
          <p class="text-muted-foreground text-sm sm:text-base font-medium">No hay entrenamientos registrados</p>
          <p class="text-muted-foreground/70 text-xs sm:text-sm">Comienza tu primer entrenamiento</p>
        </div>
        <Button variant="outline" size="lg" class="mt-2" @click="emit('add')">
          <Plus class="h-4 w-4 mr-2" />
          Iniciar entrenamiento
        </Button>
      </div>
    </div>

    <div v-else class="space-y-2 sm:space-y-3">
      <WorkoutCard v-for="workout in workouts" :key="workout.id" :workout="workout" @view="emit('view', $event)"
        @delete="emit('delete', $event)" />
    </div>
  </section>
</template>
