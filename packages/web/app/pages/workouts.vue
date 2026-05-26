<script setup lang="ts">
import { Dumbbell, Plus, Play } from 'lucide-vue-next';
import WorkoutStats from '@/components/workouts/WorkoutStats.vue';
import WorkoutStatsSkeleton from '@/components/workouts/WorkoutStatsSkeleton.vue';
import WorkoutDetailStats from '@/components/workouts/WorkoutDetailStats.vue';
import WorkoutList from '@/components/workouts/WorkoutList.vue';
import StartWorkoutModal from '@/components/workouts/StartWorkoutModal.vue';
import ActiveWorkoutModal from '@/components/workouts/ActiveWorkoutModal.vue';
import DeleteWorkoutConfirmModal from '@/components/workouts/DeleteWorkoutConfirmModal.vue';
import WorkoutDetailModal from '@/components/workouts/WorkoutDetailModal.vue';
import { useWorkoutsPage } from '@/composables/useWorkoutsPage';

const {
  workouts,
  currentWorkout,
  currentWorkoutStats,
  loading,
  newExerciseName,
  addingExercise,
  addingSets,
  updatingSets,
  savedSets,
  startingWorkout,
  stats,
  elapsedTime,
  modal,
  workoutModal,
  startWorkout,
  addExercise,
  addSetToExercise,
  removeSet,
  updateSet,
  saveSet,
  completeWorkout,
  deleteWorkoutEntry,
  openDeleteModal,
  viewWorkoutDetail,
  deleteModal,
  detailModal,
  workoutToDelete,
  workoutToView,
  deletingWorkout,
  initialize,
} = useWorkoutsPage();

useSeoMeta({
  title: 'Tus entrenamientos',
  description: 'Gestiona y registra tus entrenamientos en FreakDays',
});

onMounted(() => {
  initialize();
});
</script>

<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Arcade page header -->
    <header
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0"
    >
      <div>
        <p
          class="flex items-center gap-1.5 font-pixel text-[8px] text-primary/80 uppercase tracking-wider mb-1"
        >
          <span class="text-primary">▸</span> GYM
        </p>
        <h1 class="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Dumbbell class="h-5 w-5 sm:h-6 sm:w-6 text-primary" aria-hidden="true" />
          Entrenamientos
        </h1>
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <Button
          v-if="!currentWorkout"
          size="lg"
          class="btn-game flex-1 sm:flex-none sm:h-10 sm:w-auto rounded-none font-pixel text-[10px] cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
          @click="modal.open()"
        >
          <Plus class="h-4 w-4 sm:h-5 sm:w-5 mr-2" aria-hidden="true" />
          <span class="sm:hidden">NUEVO</span>
          <span class="hidden sm:inline">NUEVO ENTRENAMIENTO</span>
        </Button>
        <Button
          v-else
          variant="outline"
          size="lg"
          class="btn-game flex-1 sm:flex-none rounded-none font-pixel text-[10px] gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
          @click="workoutModal.open()"
        >
          <Play class="h-4 w-4" aria-hidden="true" />
          <span class="sm:hidden">EN CURSO</span>
          <span class="hidden sm:inline">ENTRENAMIENTO EN CURSO</span>
        </Button>
      </div>
    </header>

    <WorkoutStatsSkeleton v-if="loading" />
    <div v-else class="space-y-4 sm:space-y-6">
      <div v-if="currentWorkout && currentWorkoutStats">
        <div class="flex items-center gap-2 mb-3 sm:mb-4">
          <span class="w-2 h-2 bg-primary motion-safe:animate-pulse" aria-hidden="true" />
          <p class="font-pixel text-[8px] text-muted-foreground/80 uppercase tracking-wider">
            ENTRENAMIENTO EN CURSO
          </p>
        </div>
        <WorkoutDetailStats :stats="currentWorkoutStats" />
      </div>
      <div>
        <p
          class="flex items-center gap-1.5 font-pixel text-[8px] text-muted-foreground/80 uppercase tracking-wider mb-3 sm:mb-4 px-1"
        >
          <span class="inline-block w-1.5 h-1.5 bg-primary/60" aria-hidden="true" />
          ESTADÍSTICAS GENERALES
        </p>
        <WorkoutStats
          :weekly-count="stats.count"
          :total-count="workouts.length"
          :weekly-minutes="stats.totalMinutes"
        />
      </div>
    </div>

    <WorkoutList
      :workouts="workouts"
      :loading="loading"
      @view="viewWorkoutDetail"
      @delete="openDeleteModal"
      @add="modal.open()"
    />

    <StartWorkoutModal
      :open="modal.isOpen.value"
      :starting="startingWorkout"
      @close="modal.close()"
      @start="startWorkout"
    />

    <ActiveWorkoutModal
      v-if="currentWorkout"
      v-model:new-exercise-name="newExerciseName"
      :workout="currentWorkout"
      :elapsed-time="elapsedTime"
      :adding-exercise="addingExercise"
      :adding-sets="addingSets"
      :updating-sets="updatingSets"
      :saved-sets="savedSets"
      @close="workoutModal.close()"
      @add-exercise="addExercise"
      @add-set="addSetToExercise"
      @update-set="updateSet"
      @save-set="saveSet"
      @remove-set="removeSet"
      @complete="completeWorkout"
    />

    <DeleteWorkoutConfirmModal
      :open="deleteModal.isOpen.value"
      :workout="workoutToDelete"
      :is-submitting="deletingWorkout"
      @close="deleteModal.close()"
      @confirm="deleteWorkoutEntry"
    />

    <WorkoutDetailModal
      :open="detailModal.isOpen.value"
      :workout="workoutToView"
      @close="detailModal.close()"
    />
  </div>
</template>
