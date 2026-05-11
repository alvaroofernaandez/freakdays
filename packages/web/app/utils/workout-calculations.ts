import type { Workout } from '../composables/useWorkouts'

export interface WorkoutStats {
  totalExercises: number
  totalSets: number
  totalReps: number
  totalVolume: number
  avgWeight: number
}

export function calculateWorkoutStats(workout: Workout): WorkoutStats {
  const totalExercises = workout.exercises.length
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
  const totalReps = workout.exercises.reduce((sum, ex) => 
    sum + ex.sets.reduce((s, set) => s + (set.reps ?? 0), 0), 0
  )
  const totalVolume = workout.exercises.reduce((sum, ex) => 
    sum + ex.sets.reduce((s, set) => s + ((set.reps ?? 0) * (set.weightKg ?? 0)), 0), 0
  )
  const avgWeight = totalSets > 0 
    ? workout.exercises.reduce((sum, ex) => 
        sum + ex.sets.reduce((s, set) => s + (set.weightKg ?? 0), 0), 0
      ) / totalSets
    : 0

  return {
    totalExercises,
    totalSets,
    totalReps,
    totalVolume: Math.round(totalVolume * 10) / 10,
    avgWeight: Math.round(avgWeight * 10) / 10,
  }
}

