<script setup lang="ts">
import { Dumbbell, Eye, Trash2 } from 'lucide-vue-next';
import type { Workout } from '@/composables/useWorkouts';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  readonly exercises: readonly {
    readonly id: string;
    readonly exerciseName: string;
    readonly notes: string | null;
    readonly orderIndex: number;
    readonly sets: readonly {
      readonly id: string;
      readonly setNumber: number;
      readonly reps: number | null;
      readonly weightKg: number | null;
      readonly restSeconds: number | null;
      readonly notes: string | null;
    }[];
  }[];
};

interface Props {
  workout: Workout | ReadonlyWorkout;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  view: [id: string];
  delete: [id: string];
}>();

function formatDate(date: Date) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Hoy';
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
  return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatDuration(minutes: number | null) {
  if (!minutes) return '0 min';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

function handleViewClick(event: MouseEvent) {
  event.stopPropagation();
  event.preventDefault();
  emit('view', props.workout.id);
}

function handleDeleteClick(event: MouseEvent) {
  event.stopPropagation();
  event.preventDefault();
  emit('delete', props.workout.id);
}
</script>

<template>
  <Card
    class="group relative rounded-none border-2 border-primary/20 bg-card/60 hover:border-primary/50 hover:brightness-105 shadow-[0_5px_0_0_oklch(0.42_0.16_290)] hover:shadow-[0_5px_0_0_oklch(0.52_0.2_290)] active:translate-y-[4px] active:shadow-[0_1px_0_0_oklch(0.42_0.16_290)] transition-[transform,filter,box-shadow,border-color] duration-100 motion-reduce:active:translate-y-0 cursor-pointer"
  >
    <!-- HUD corner brackets -->
    <span
      class="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-primary/50"
      aria-hidden="true"
    />
    <span
      class="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-primary/50"
      aria-hidden="true"
    />
    <span
      class="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-primary/50"
      aria-hidden="true"
    />
    <span
      class="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-primary/50"
      aria-hidden="true"
    />

    <CardHeader class="flex flex-row items-center gap-3 py-3 sm:py-4 px-3 sm:px-4">
      <!-- Notched icon frame -->
      <div
        class="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-primary/15 flex items-center justify-center"
        style="
          clip-path: polygon(
            0 4px,
            4px 4px,
            4px 0,
            calc(100% - 4px) 0,
            calc(100% - 4px) 4px,
            100% 4px,
            100% calc(100% - 4px),
            calc(100% - 4px) calc(100% - 4px),
            calc(100% - 4px) 100%,
            4px 100%,
            4px calc(100% - 4px),
            0 calc(100% - 4px)
          );
        "
        aria-hidden="true"
      >
        <Dumbbell class="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
      </div>

      <div class="flex-1 min-w-0">
        <CardTitle class="text-sm sm:text-base font-medium truncate">
          {{ workout.name }}
        </CardTitle>
        <CardDescription
          class="text-xs sm:text-sm mt-0.5 flex items-center gap-2 flex-wrap font-pixel text-[8px]"
        >
          <span class="text-muted-foreground/80">
            {{ workout.exercises.length }}
            {{ workout.exercises.length === 1 ? 'EJERCICIO' : 'EJERCICIOS' }}
          </span>
          <span class="text-muted-foreground/40">·</span>
          <span class="text-muted-foreground/80">{{
            formatDuration(workout.durationMinutes)
          }}</span>
        </CardDescription>
      </div>

      <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8 sm:h-9 sm:w-9 rounded-none text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors touch-manipulation cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Ver detalles del entrenamiento"
          @click="handleViewClick"
        >
          <Eye class="h-4 w-4" aria-hidden="true" />
        </Button>
        <Badge
          variant="outline"
          class="font-pixel text-[8px] rounded-none border-primary/30 hidden sm:inline-flex px-2 py-0.5"
        >
          {{ formatDate(workout.workoutDate) }}
        </Badge>
        <span class="font-pixel text-[8px] text-muted-foreground sm:hidden px-1">
          {{ formatDate(workout.workoutDate) }}
        </span>
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8 sm:h-9 sm:w-9 rounded-none text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors touch-manipulation cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Eliminar entrenamiento"
          @click="handleDeleteClick"
        >
          <Trash2 class="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </CardHeader>
  </Card>
</template>
