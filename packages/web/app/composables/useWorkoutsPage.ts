import type { Workout } from '@/composables/useWorkouts'
import { getElapsedTime, getTodayDate } from '@/utils/workout-formatters'
import { calculateWorkoutStats } from '@/utils/workout-calculations'

export function useWorkoutsPage() {
  const workoutsApi = useWorkouts()
  const modal = useModal()
  const workoutModal = useModal()
  const route = useRoute()
  const router = useRouter()

  const currentWorkout = ref<Workout | null>(null)
  const newExerciseName = ref('')
  const addingExercise = ref(false)
  const stats = ref({ count: 0, totalMinutes: 0 })
  const elapsedTime = ref('0 min')

  let elapsedInterval: ReturnType<typeof setInterval> | null = null

  const { data: workoutsData, loading, reload: reloadData } = usePageData({
    fetcher: async () => {
      const [workouts, statsResult] = await Promise.all([
        workoutsApi.fetchWorkouts(),
        workoutsApi.getWeeklyStats()
      ])
      stats.value = statsResult
      return workouts.filter(w => w.status === 'completed')
    },
  })

  const workouts = computed(() => workoutsData.value || [])

  const currentWorkoutStats = computed(() => {
    if (!currentWorkout.value) return null
    return calculateWorkoutStats(currentWorkout.value)
  })

  async function checkInProgressWorkout() {
    const inProgress = await workoutsApi.getInProgressWorkout()
    if (inProgress) {
      currentWorkout.value = inProgress
      workoutModal.open()
    }
  }

    const startingWorkout = ref(false)

  async function startWorkout(workoutForm: { name: string; description: string; workout_date: string }) {
    if (!workoutForm.name.trim() || startingWorkout.value) return

    startingWorkout.value = true
    try {
      const created = await workoutsApi.createWorkout({
        name: workoutForm.name.trim(),
        description: workoutForm.description?.trim() || undefined,
        workout_date: workoutForm.workout_date || getTodayDate(),
        status: 'in_progress',
      })

      if (created) {
        currentWorkout.value = created
        modal.close()
        workoutModal.open()
      }
    } catch (error) {
      console.error('Error starting workout:', error)
    } finally {
      startingWorkout.value = false
    }
  }

  async function addExercise() {
    if (!currentWorkout.value || !newExerciseName.value.trim() || addingExercise.value) return

    const exerciseName = newExerciseName.value.trim()
    addingExercise.value = true
    try {
      const exercise = await workoutsApi.addExercise(currentWorkout.value.id, exerciseName)
      if (exercise && currentWorkout.value) {
        currentWorkout.value.exercises.push(exercise)
        newExerciseName.value = ''
      }
    } finally {
      addingExercise.value = false
    }
  }

  const addingSets = ref<Set<string>>(new Set())

  async function addSetToExercise(exerciseId: string) {
    if (!currentWorkout.value || addingSets.value.has(exerciseId)) return

    const exercise = currentWorkout.value.exercises.find(e => e.id === exerciseId)
    if (!exercise) return

    addingSets.value.add(exerciseId)
    try {
      const newSet = await workoutsApi.addSet(exercise.id, {})
      if (newSet && currentWorkout.value) {
        exercise.sets.push(newSet)
        exercise.sets.sort((a, b) => a.setNumber - b.setNumber)
      }
    } catch (error) {
      console.error('Error adding set:', error)
    } finally {
      addingSets.value.delete(exerciseId)
    }
  }

  async function removeSet(exerciseId: string, setId: string) {
    if (!currentWorkout.value || !setId || typeof setId !== 'string' || setId.length < 10) {
      return
    }

    const exercise = currentWorkout.value.exercises.find(e => e.id === exerciseId)
    if (!exercise) {
      return
    }

    const set = exercise.sets.find(s => s.id === setId)
    if (!set) {
      return
    }

    const success = await workoutsApi.deleteSet(setId)
    if (success) {
      exercise.sets = exercise.sets.filter(s => s.id !== setId)
    }
  }

  const setUpdateTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

  const updatingSets = ref<Set<string>>(new Set())
  const savedSets = ref<Set<string>>(new Set())

  async function updateSet(exerciseId: string, setId: string, updates: { reps?: number; weight_kg?: number }) {
    if (!currentWorkout.value || !setId || setId.length < 10) return

    const exercise = currentWorkout.value.exercises.find(e => e.id === exerciseId)
    if (!exercise) return

    const set = exercise.sets.find(s => s.id === setId)
    if (!set) return

    set.reps = updates.reps !== undefined ? updates.reps : set.reps
    set.weightKg = updates.weight_kg !== undefined ? updates.weight_kg : set.weightKg

    if (setUpdateTimeouts.has(setId)) {
      clearTimeout(setUpdateTimeouts.get(setId)!)
      savedSets.value.delete(setId)
    }

    const timeout = setTimeout(async () => {
      updatingSets.value.add(setId)
      try {
        const updatePayload: { reps?: number | null; weight_kg?: number | null } = {}
        
        if (updates.reps !== undefined) {
          updatePayload.reps = updates.reps === null || updates.reps === '' ? null : Number(updates.reps)
        }
        if (updates.weight_kg !== undefined) {
          updatePayload.weight_kg = updates.weight_kg === null || updates.weight_kg === '' ? null : Number(updates.weight_kg)
        }

        const updatedSet = await workoutsApi.updateSet(setId, updatePayload)

        if (updatedSet) {
          set.reps = updatedSet.reps
          set.weightKg = updatedSet.weightKg
          set.restSeconds = updatedSet.restSeconds
        }

        savedSets.value.add(setId)
        setTimeout(() => savedSets.value.delete(setId), 2000)
      } catch (error) {
        console.error('Error updating set:', error)
        savedSets.value.delete(setId)
      } finally {
        updatingSets.value.delete(setId)
        setUpdateTimeouts.delete(setId)
      }
    }, 1000)

    setUpdateTimeouts.set(setId, timeout)
  }

  async function saveSet(exerciseId: string, setId: string, updates: { reps?: number; weight_kg?: number }) {
    if (!currentWorkout.value || !setId || setId.length < 10) return

    const exercise = currentWorkout.value.exercises.find(e => e.id === exerciseId)
    if (!exercise) return

    const set = exercise.sets.find(s => s.id === setId)
    if (!set) return

    if (setUpdateTimeouts.has(setId)) {
      clearTimeout(setUpdateTimeouts.get(setId)!)
      setUpdateTimeouts.delete(setId)
    }

    updatingSets.value.add(setId)
    savedSets.value.delete(setId)

    try {
      const updatePayload: { reps?: number | null; weight_kg?: number | null } = {}
      
      if (updates.reps !== undefined) {
        updatePayload.reps = updates.reps === null || updates.reps === '' ? null : Number(updates.reps)
      }
      if (updates.weight_kg !== undefined) {
        updatePayload.weight_kg = updates.weight_kg === null || updates.weight_kg === '' ? null : Number(updates.weight_kg)
      }

      const updatedSet = await workoutsApi.updateSet(setId, updatePayload)

      if (updatedSet) {
        set.reps = updatedSet.reps
        set.weightKg = updatedSet.weightKg
        set.restSeconds = updatedSet.restSeconds
      }

      savedSets.value.add(setId)
      setTimeout(() => savedSets.value.delete(setId), 2000)
    } catch (error) {
      console.error('Error saving set:', error)
    } finally {
      updatingSets.value.delete(setId)
    }
  }

  async function completeWorkout() {
    if (!currentWorkout.value) return

    const startTime = currentWorkout.value.startedAt
    const endTime = new Date()
    const durationMinutes = startTime
      ? Math.round((endTime.getTime() - startTime.getTime()) / 60000)
      : undefined

    const success = await workoutsApi.completeWorkout(currentWorkout.value.id, durationMinutes)
    if (success) {
      currentWorkout.value = null
      workoutModal.close()
      await reloadData()
    }
  }

  const deleteModal = useModal()
  const detailModal = useModal()
  const workoutToDelete = ref<Workout | null>(null)
  const workoutToView = ref<Workout | null>(null)
  const deletingWorkout = ref(false)

  function openDeleteModal(workoutId: string) {
    const workout = workouts.value.find(w => w.id === workoutId)
    if (workout) {
      workoutToDelete.value = workout
      deleteModal.open()
    }
  }

  function viewWorkoutDetail(workoutId: string) {
    const workout = workouts.value.find(w => w.id === workoutId)
    if (workout) {
      workoutToView.value = workout
      detailModal.open()
    }
  }

  async function deleteWorkoutEntry(id: string) {
    if (deletingWorkout.value) return

    deletingWorkout.value = true
    try {
      const success = await workoutsApi.deleteWorkout(id)
      if (success) {
        deleteModal.close()
        workoutToDelete.value = null
        await reloadData()
        
        if (route.params.id === id) {
          navigateTo('/workouts')
        }
      }
    } catch (error) {
      console.error('Error deleting workout:', error)
    } finally {
      deletingWorkout.value = false
    }
  }

  function updateElapsedTime() {
    if (currentWorkout.value?.startedAt) {
      elapsedTime.value = getElapsedTime(currentWorkout.value.startedAt)
    }
  }

  watch(() => workoutModal.isOpen.value, (isOpen) => {
    if (isOpen && currentWorkout.value?.startedAt) {
      updateElapsedTime()
      elapsedInterval = setInterval(updateElapsedTime, 1000)
    } else if (elapsedInterval) {
      clearInterval(elapsedInterval)
      elapsedInterval = null
    }
  })

  watch(() => currentWorkout.value?.startedAt, () => {
    if (workoutModal.isOpen.value) {
      updateElapsedTime()
    }
  })

  onUnmounted(() => {
    if (elapsedInterval) {
      clearInterval(elapsedInterval)
    }
    setUpdateTimeouts.forEach(timeout => clearTimeout(timeout))
    setUpdateTimeouts.clear()
  })

  async function initialize() {
    await Promise.all([
      reloadData(),
      checkInProgressWorkout()
    ])
  }

  return {
    workouts: readonly(workouts),
    currentWorkout,
    currentWorkoutStats: readonly(currentWorkoutStats),
    loading: readonly(loading),
    newExerciseName,
    addingExercise: readonly(addingExercise),
    addingSets: computed(() => addingSets.value),
    updatingSets: computed(() => updatingSets.value),
    savedSets: computed(() => savedSets.value),
    startingWorkout: readonly(startingWorkout),
    stats: readonly(stats),
    elapsedTime: readonly(elapsedTime),
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
    deletingWorkout: readonly(deletingWorkout),
    initialize,
  }
}

