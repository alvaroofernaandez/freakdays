<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Workout } from '@/composables/useWorkouts'
import { calculateWorkoutStats } from '@/utils/workout-calculations'
import { formatDate, formatDuration } from '@/utils/workout-formatters'
import { Clock, Dumbbell, X } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import ExerciseCard from './ExerciseCard.vue'
import WorkoutDetailStats from './WorkoutDetailStats.vue'

interface Props {
  open: boolean
  workout: Workout | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const stats = computed(() => {
  if (!props.workout) return null
  return calculateWorkoutStats(props.workout)
})

function handleClose() {
  emit('close')
}

onMounted(() => {
  if (props.open) {
    document.body.style.overflow = 'hidden'
  }
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="open && workout"
          class="fixed inset-0 z-100 flex items-start sm:items-center justify-center p-0 sm:p-4 bg-background/95 backdrop-blur-sm overflow-hidden"
          style="pointer-events: auto;" @click.self="handleClose" @keydown.esc="handleClose" role="dialog"
          aria-modal="true" aria-labelledby="workout-detail-title" aria-describedby="workout-detail-description">
          <Card
            class="w-full max-w-3xl h-full sm:h-auto sm:max-h-[90vh] my-0 sm:my-8 shadow-xl border-0 sm:border-2 rounded-none sm:rounded-lg flex flex-col"
            @click.stop>
            <CardHeader
              class="flex flex-row items-center justify-between pb-3 sm:pb-4 p-4 sm:p-6 shrink-0 bg-background border-b">
              <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div
                  class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Dumbbell class="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div class="flex-1 min-w-0">
                  <CardTitle id="workout-detail-title"
                    class="text-lg sm:text-xl font-bold truncate flex items-center gap-2">
                    {{ workout.name }}
                  </CardTitle>
                  <CardDescription id="workout-detail-description"
                    class="text-xs sm:text-sm mt-1 flex items-center gap-3 flex-wrap">
                    <span class="flex items-center gap-1.5">
                      <Clock class="h-3 w-3 sm:h-4 sm:w-4" />
                      {{ formatDate(workout.workoutDate) }} · {{ formatDuration(workout.durationMinutes) }}
                    </span>
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon"
                class="h-9 w-9 sm:h-10 sm:w-10 hover:bg-muted hover:text-foreground cursor-pointer shrink-0 touch-manipulation"
                @click="handleClose" aria-label="Cerrar detalles del entrenamiento">
                <X class="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </CardHeader>

            <CardContent class="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1 min-h-0">
              <div v-if="workout.description" class="p-3 sm:p-4 bg-muted/30 rounded-lg border">
                <p class="text-sm sm:text-base text-muted-foreground">{{ workout.description }}</p>
              </div>

              <WorkoutDetailStats v-if="stats" :stats="stats" />

              <div v-if="workout.exercises.length === 0" class="text-center py-12 sm:py-16">
                <div class="flex flex-col items-center gap-4">
                  <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Dumbbell class="h-8 w-8 sm:h-10 sm:w-10 text-primary/50" />
                  </div>
                  <div class="space-y-2">
                    <p class="text-muted-foreground text-sm sm:text-base font-medium">No hay ejercicios registrados</p>
                  </div>
                </div>
              </div>

              <div v-else class="space-y-3 sm:space-y-4">
                <h3 class="text-sm sm:text-base font-semibold text-muted-foreground uppercase tracking-wider">
                  Ejercicios
                </h3>
                <ExerciseCard v-for="exercise in workout.exercises" :key="exercise.id" :exercise="exercise"
                  :is-active="false" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
