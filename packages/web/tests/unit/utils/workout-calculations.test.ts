import { describe, it, expect } from 'vitest'
import { calculateWorkoutStats } from '../../../app/utils/workout-calculations'
import type { Workout } from '../../../app/composables/useWorkouts'

describe('workout-calculations', () => {
  describe('calculateWorkoutStats', () => {
    it('should calculate stats for empty workout', () => {
      const workout: Workout = {
        id: '1',
        name: 'Test',
        date: new Date(),
        exercises: [],
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const stats = calculateWorkoutStats(workout)

      expect(stats.totalExercises).toBe(0)
      expect(stats.totalSets).toBe(0)
      expect(stats.totalReps).toBe(0)
      expect(stats.totalVolume).toBe(0)
      expect(stats.avgWeight).toBe(0)
    })

    it('should calculate total exercises', () => {
      const workout: Workout = {
        id: '1',
        name: 'Test',
        date: new Date(),
        exercises: [
          {
            id: '1',
            name: 'Exercise 1',
            sets: [],
          },
          {
            id: '2',
            name: 'Exercise 2',
            sets: [],
          },
        ],
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const stats = calculateWorkoutStats(workout)

      expect(stats.totalExercises).toBe(2)
    })

    it('should calculate total sets', () => {
      const workout: Workout = {
        id: '1',
        name: 'Test',
        date: new Date(),
        exercises: [
          {
            id: '1',
            name: 'Exercise 1',
            sets: [
              { id: '1', reps: 10, weightKg: 20 },
              { id: '2', reps: 10, weightKg: 20 },
            ],
          },
          {
            id: '2',
            name: 'Exercise 2',
            sets: [
              { id: '3', reps: 8, weightKg: 30 },
            ],
          },
        ],
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const stats = calculateWorkoutStats(workout)

      expect(stats.totalSets).toBe(3)
    })

    it('should calculate total reps', () => {
      const workout: Workout = {
        id: '1',
        name: 'Test',
        date: new Date(),
        exercises: [
          {
            id: '1',
            name: 'Exercise 1',
            sets: [
              { id: '1', reps: 10, weightKg: 20 },
              { id: '2', reps: 12, weightKg: 20 },
            ],
          },
        ],
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const stats = calculateWorkoutStats(workout)

      expect(stats.totalReps).toBe(22)
    })

    it('should calculate total volume', () => {
      const workout: Workout = {
        id: '1',
        name: 'Test',
        date: new Date(),
        exercises: [
          {
            id: '1',
            name: 'Exercise 1',
            sets: [
              { id: '1', reps: 10, weightKg: 20 },
              { id: '2', reps: 10, weightKg: 25 },
            ],
          },
        ],
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const stats = calculateWorkoutStats(workout)

      expect(stats.totalVolume).toBe(450)
    })

    it('should calculate average weight', () => {
      const workout: Workout = {
        id: '1',
        name: 'Test',
        date: new Date(),
        exercises: [
          {
            id: '1',
            name: 'Exercise 1',
            sets: [
              { id: '1', reps: 10, weightKg: 20 },
              { id: '2', reps: 10, weightKg: 30 },
            ],
          },
        ],
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const stats = calculateWorkoutStats(workout)

      expect(stats.avgWeight).toBe(25)
    })

    it('should handle null reps and weight', () => {
      const workout: Workout = {
        id: '1',
        name: 'Test',
        date: new Date(),
        exercises: [
          {
            id: '1',
            name: 'Exercise 1',
            sets: [
              { id: '1', reps: null, weightKg: null },
              { id: '2', reps: 10, weightKg: 20 },
            ],
          },
        ],
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const stats = calculateWorkoutStats(workout)

      expect(stats.totalReps).toBe(10)
      expect(stats.totalVolume).toBe(200)
    })

    it('should round average weight to one decimal', () => {
      const workout: Workout = {
        id: '1',
        name: 'Test',
        date: new Date(),
        exercises: [
          {
            id: '1',
            name: 'Exercise 1',
            sets: [
              { id: '1', reps: 10, weightKg: 20.33 },
              { id: '2', reps: 10, weightKg: 30.66 },
            ],
          },
        ],
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const stats = calculateWorkoutStats(workout)

      expect(stats.avgWeight).toBe(25.5)
    })
  })
})

