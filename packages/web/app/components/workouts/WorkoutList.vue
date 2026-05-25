<script setup lang="ts">
import type { Workout } from '@/composables/useWorkouts';
import { Dumbbell, Plus } from 'lucide-vue-next';
import WorkoutCard from './WorkoutCard.vue';
import WorkoutCardSkeleton from './WorkoutCardSkeleton.vue';

type ReadonlyWorkout = {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly workoutDate: Date;
  readonly durationMinutes: number | null;
  readonly notes: string | null;
  readonly status: 'in_progress' | 'completed';
  readonly startedAt: Date | null;
  readonly completedAt: Date | null;
  readonly exercises: readonly ReadonlyWorkoutExercise[];
};

type ReadonlyWorkoutExercise = {
  readonly id: string;
  readonly exerciseName: string;
  readonly notes: string | null;
  readonly orderIndex: number;
  readonly sets: readonly ReadonlyWorkoutSet[];
};

type ReadonlyWorkoutSet = {
  readonly id: string;
  readonly setNumber: number;
  readonly reps: number | null;
  readonly weightKg: number | null;
  readonly restSeconds: number | null;
  readonly notes: string | null;
};

interface Props {
  workouts: readonly ReadonlyWorkout[] | Workout[];
  loading: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  view: [id: string];
  delete: [id: string];
  add: [];
}>();

const NOTCH =
  'polygon(0 6px,6px 6px,6px 0,calc(100% - 6px) 0,calc(100% - 6px) 6px,100% 6px,100% calc(100% - 6px),calc(100% - 6px) calc(100% - 6px),calc(100% - 6px) 100%,6px 100%,6px calc(100% - 6px),0 calc(100% - 6px))';
</script>

<template>
  <section class="space-y-3" aria-label="Historial de entrenamientos">
    <p
      class="flex items-center gap-1.5 font-pixel text-[8px] text-muted-foreground/80 uppercase tracking-wider px-1"
    >
      <span
        class="inline-block w-1.5 h-1.5 bg-primary motion-safe:animate-pulse"
        aria-hidden="true"
      />
      HISTORIAL RECIENTE
    </p>

    <template v-if="loading">
      <WorkoutCardSkeleton v-for="i in 3" :key="i" />
    </template>

    <div
      v-else-if="workouts.length === 0"
      class="flex flex-col items-center gap-4 py-12 sm:py-16 text-center"
      role="status"
      aria-live="polite"
    >
      <div
        class="w-16 h-16 sm:w-20 sm:h-20 bg-primary/15 flex items-center justify-center"
        :style="{ clipPath: NOTCH }"
        aria-hidden="true"
      >
        <Dumbbell class="h-8 w-8 sm:h-10 sm:w-10 text-primary/60" />
      </div>
      <div class="space-y-1">
        <p class="font-pixel text-[9px] text-muted-foreground uppercase tracking-wider">
          SIN DATOS
        </p>
        <p class="text-muted-foreground/70 text-xs sm:text-sm">
          Aún no hay entrenamientos registrados
        </p>
      </div>
      <Button
        variant="outline"
        size="lg"
        class="mt-2 btn-game rounded-none border-2 font-pixel text-[9px] cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
        @click="emit('add')"
      >
        <Plus class="h-4 w-4 mr-2" aria-hidden="true" />
        INICIAR ENTRENAMIENTO
      </Button>
    </div>

    <div v-else class="space-y-2 sm:space-y-3">
      <WorkoutCard
        v-for="workout in workouts"
        :key="workout.id"
        :workout="workout"
        @view="emit('view', $event)"
        @delete="emit('delete', $event)"
      />
    </div>
  </section>
</template>
