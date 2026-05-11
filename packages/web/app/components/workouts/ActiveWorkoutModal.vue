<script setup lang="ts">
import { X, Clock, Plus, Check, Dumbbell, Loader2 } from 'lucide-vue-next'
import type { Workout, WorkoutExercise } from '@/composables/useWorkouts'
import { getElapsedTime } from '@/utils/workout-formatters'
import { calculateWorkoutStats } from '@/utils/workout-calculations'
import { CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ExerciseCard from './ExerciseCard.vue'
import WorkoutDetailStats from './WorkoutDetailStats.vue'

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
  workout: ReadonlyWorkout | Workout
  elapsedTime: string
  newExerciseName: string
  addingExercise: boolean
  addingSets?: Set<string>
  updatingSets?: Set<string>
  savedSets?: Set<string>
}

const props = withDefaults(defineProps<Props>(), {
  addingSets: () => new Set<string>() as Set<string>,
  updatingSets: () => new Set<string>() as Set<string>,
  savedSets: () => new Set<string>() as Set<string>,
})

const emit = defineEmits<{
  close: []
  addExercise: []
  addSet: [exerciseId: string]
  updateSet: [exerciseId: string, setId: string, updates: { reps?: number; weight_kg?: number }]
  saveSet: [exerciseId: string, setId: string, updates: { reps?: number; weight_kg?: number }]
  removeSet: [exerciseId: string, setId: string]
  complete: []
  'update:newExerciseName': [value: string]
}>()

function handleAddExercise() {
  emit('addExercise')
}

const stats = computed(() => {
  return calculateWorkoutStats(props.workout as Workout)
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex flex-col bg-background overflow-hidden">
    <div class="flex-1 overflow-y-auto">
      <div class="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div class="max-w-2xl mx-auto px-4 py-3 sm:py-4">
          <div class="flex items-center justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <div class="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <CardTitle class="text-base sm:text-lg font-bold truncate flex items-center gap-2">
                  {{ workout.name }}
                </CardTitle>
              </div>
              <CardDescription class="text-xs sm:text-sm flex items-center gap-1.5">
                <Clock class="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{{ elapsedTime }}</span>
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              class="h-9 w-9 sm:h-10 sm:w-10 hover:bg-muted hover:text-foreground cursor-pointer shrink-0" 
              @click="emit('close')"
            >
              <X class="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div class="max-w-2xl mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <WorkoutDetailStats v-if="workout.exercises.length > 0" :stats="stats" />

        <div v-if="workout.exercises.length === 0" class="text-center py-12 sm:py-16">
          <div class="flex flex-col items-center gap-4">
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Dumbbell class="h-8 w-8 sm:h-10 sm:w-10 text-primary/50" />
            </div>
            <div class="space-y-2">
              <p class="text-muted-foreground text-sm sm:text-base font-medium">No hay ejercicios añadidos</p>
              <p class="text-muted-foreground/70 text-xs sm:text-sm">Añade tu primer ejercicio abajo</p>
            </div>
          </div>
        </div>

        <div v-else class="space-y-3 sm:space-y-4">
          <ExerciseCard
            v-for="exercise in workout.exercises"
            :key="exercise.id"
            :exercise="exercise"
            :is-active="true"
            :adding-set="addingSets && typeof addingSets.has === 'function' ? addingSets.has(exercise.id) : false"
            :updating-sets="updatingSets"
            :saved-sets="savedSets"
            @add-set="emit('addSet', $event)"
            @update-set="(exerciseId, setId, updates) => emit('updateSet', exerciseId, setId, updates)"
            @save-set="(exerciseId, setId, updates) => emit('saveSet', exerciseId, setId, updates)"
            @remove-set="(exerciseId, setId) => emit('removeSet', exerciseId, setId)"
          />
        </div>

        <div class="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t pt-4 pb-4 sm:pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6">
          <div class="space-y-3">
            <div class="flex gap-2">
              <Input 
                :model-value="newExerciseName"
                @update:model-value="emit('update:newExerciseName', $event)"
                placeholder="Nombre del ejercicio" 
                class="flex-1 h-11 sm:h-12 text-base"
                @keyup.enter="handleAddExercise"
              />
              <Button 
                size="lg"
                class="h-11 sm:h-12 px-6 shrink-0" 
                @click="handleAddExercise" 
                :disabled="!newExerciseName.trim() || addingExercise"
              >
                <Plus v-if="!addingExercise" class="h-5 w-5 mr-2" />
                <Loader2 v-else class="h-5 w-5 mr-2 animate-spin" />
                <span class="hidden sm:inline">{{ addingExercise ? 'Añadiendo...' : 'Añadir' }}</span>
              </Button>
            </div>
            
            <Button 
              size="lg"
              class="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold" 
              @click="emit('complete')"
            >
              <Check class="h-5 w-5 mr-2" />
              Finalizar Entrenamiento
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

