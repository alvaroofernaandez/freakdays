import { useAuthStore } from "~~/stores/auth";

export interface Workout {
  id: string;
  name: string;
  description: string | null;
  workoutDate: Date;
  durationMinutes: number | null;
  notes: string | null;
  status: 'in_progress' | 'completed';
  startedAt: Date | null;
  completedAt: Date | null;
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  exerciseName: string;
  notes: string | null;
  orderIndex: number;
  sets: WorkoutSet[];
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  reps: number | null;
  weightKg: number | null;
  restSeconds: number | null;
  notes: string | null;
}

export interface CreateWorkoutDTO {
  name: string;
  description?: string;
  workout_date: string;
  duration_minutes?: number;
  status?: 'in_progress' | 'completed';
}

export function useWorkouts() {
  const authStore = useAuthStore();
  const apiClient = useApiClient();
  const authContext = useAuthContext();

  async function refreshAuthContext() {
    try {
      await authContext.refresh();
    } catch {
      // no-op
    }
  }

  async function fetchWorkouts(limit = 20): Promise<Workout[]> {
    if (!authStore.userId) return [];

    await refreshAuthContext();

    try {
      const data = await apiClient.get<Array<Record<string, unknown>>>("/v1/workouts", {
        requireOrg: true,
        query: {
          limit,
        },
      });

      return (data ?? []).map(mapDbToWorkout);
    } catch (error) {
      console.error("Error fetching workouts:", error);
      return [];
    }
  }

  async function getInProgressWorkout(): Promise<Workout | null> {
    if (!authStore.userId) return null;

    await refreshAuthContext();

    try {
      const data = await apiClient.get<Record<string, unknown> | null>(
        "/v1/workouts/in-progress",
        {
          requireOrg: true,
        }
      );

      if (!data) return null;
      return mapDbToWorkout(data);
    } catch (error) {
      console.error("Error fetching in-progress workout:", error);
      return null;
    }
  }

  async function getWorkoutById(id: string): Promise<Workout | null> {
    await refreshAuthContext();

    try {
      const data = await apiClient.get<Record<string, unknown>>(`/v1/workouts/${id}`, {
        requireOrg: true,
      });
      return mapDbToWorkout(data);
    } catch (error) {
      console.error("Error fetching workout:", error);
      return null;
    }
  }

  async function createWorkout(dto: CreateWorkoutDTO): Promise<Workout | null> {
    if (!authStore.userId) return null;

    await refreshAuthContext();

    try {
      const data = await apiClient.post<Record<string, unknown>>(
        "/v1/workouts",
        {
          name: dto.name,
          description: dto.description,
          workout_date: dto.workout_date,
          duration_minutes: dto.duration_minutes,
          status: dto.status || "in_progress",
        },
        {
          requireOrg: true,
        }
      );

      return mapDbToWorkout(data);
    } catch (error) {
      console.error("Error creating workout:", error);
      return null;
    }
  }

  async function addExercise(
    workoutId: string,
    exerciseName: string
  ): Promise<WorkoutExercise | null> {
    await refreshAuthContext();

    try {
      const data = await apiClient.post<Record<string, unknown>>(
        `/v1/workouts/${workoutId}/exercises`,
        {
          exercise_name: exerciseName,
        },
        {
          requireOrg: true,
        }
      );

      return {
        id: data.id as string,
        exerciseName: data.exercise_name as string,
        notes: data.notes as string | null,
        orderIndex: data.order_index as number,
        sets: [],
      };
    } catch (error) {
      console.error("Error adding exercise:", error);
      return null;
    }
  }

  async function addSet(
    exerciseId: string,
    set: {
      reps?: number;
      weight_kg?: number;
      rest_seconds?: number;
    }
  ): Promise<WorkoutSet | null> {
    await refreshAuthContext();

    try {
      const data = await apiClient.post<Record<string, unknown>>(
        `/v1/workouts/exercises/${exerciseId}/sets`,
        {
          reps: set.reps,
          weight_kg: set.weight_kg,
          rest_seconds: set.rest_seconds,
        },
        {
          requireOrg: true,
        }
      );

      const reps = data.reps;
      const weightKg = data.weight_kg;

      return {
        id: data.id as string,
        setNumber: Number(data.set_number),
        reps: reps !== null && reps !== undefined ? Number(reps) : null,
        weightKg: weightKg !== null && weightKg !== undefined ? Number(weightKg) : null,
        restSeconds: data.rest_seconds !== null && data.rest_seconds !== undefined ? Number(data.rest_seconds) : null,
        notes: data.notes as string | null,
      };
    } catch (error) {
      console.error("Error adding set:", error);
      return null;
    }
  }

  async function updateSet(
    setId: string,
    updates: {
      reps?: number | null;
      weight_kg?: number | null;
      rest_seconds?: number | null;
    }
  ): Promise<WorkoutSet | null> {
    await refreshAuthContext();

    try {
      const data = await apiClient.patch<Record<string, unknown>>(
        `/v1/workouts/sets/${setId}`,
        {
          reps: updates.reps,
          weight_kg: updates.weight_kg,
          rest_seconds: updates.rest_seconds,
        },
        {
          requireOrg: true,
        }
      );

      const reps = data.reps;
      const weightKg = data.weight_kg;

      return {
        id: data.id as string,
        setNumber: Number(data.set_number),
        reps: reps !== null && reps !== undefined ? Number(reps) : null,
        weightKg: weightKg !== null && weightKg !== undefined ? Number(weightKg) : null,
        restSeconds: data.rest_seconds !== null && data.rest_seconds !== undefined ? Number(data.rest_seconds) : null,
        notes: data.notes as string | null,
      };
    } catch (error) {
      console.error("Error updating set:", error);
      return null;
    }
  }

  async function deleteSet(setId: string): Promise<boolean> {
    if (!setId || setId.length < 10) {
      return false;
    }

    await refreshAuthContext();

    try {
      await apiClient.del<{ success: true }>(`/v1/workouts/sets/${setId}`, {
        requireOrg: true,
      });
      return true;
    } catch (error) {
      console.error("Error deleting set:", error);
      return false;
    }
  }

  async function completeWorkout(workoutId: string, durationMinutes?: number): Promise<boolean> {
    await refreshAuthContext();

    try {
      await apiClient.patch<Record<string, unknown>>(
        `/v1/workouts/${workoutId}`,
        {
          status: "completed",
          duration_minutes: durationMinutes,
        },
        {
          requireOrg: true,
        }
      );
      return true;
    } catch (error) {
      console.error("Error completing workout:", error);
      return false;
    }
  }

  async function deleteWorkout(id: string): Promise<boolean> {
    await refreshAuthContext();

    try {
      await apiClient.del<{ success: true }>(`/v1/workouts/${id}`, {
        requireOrg: true,
      });
      return true;
    } catch (error) {
      console.error("Error deleting workout:", error);
      return false;
    }
  }

  async function getWeeklyStats(): Promise<{
    count: number;
    totalMinutes: number;
  }> {
    if (!authStore.userId) return { count: 0, totalMinutes: 0 };

    await refreshAuthContext();

    try {
      const data = await apiClient.get<{ count: number; totalMinutes: number }>(
        "/v1/workouts/weekly-stats",
        {
          requireOrg: true,
        }
      );

      return data;
    } catch (error) {
      console.error("Error fetching weekly stats:", error);
      return { count: 0, totalMinutes: 0 };
    }
  }

  function mapDbToWorkout(row: Record<string, unknown>): Workout {
    const exercises =
      (row.workout_exercises as Array<Record<string, unknown>>) ?? [];

    return {
      id: row.id as string,
      name: row.name as string,
      description: row.description as string | null,
      workoutDate: new Date(row.workout_date as string),
      durationMinutes: row.duration_minutes as number | null,
      notes: row.notes as string | null,
      status: (row.status as 'in_progress' | 'completed') || 'completed',
      startedAt: row.started_at ? new Date(row.started_at as string) : null,
      completedAt: row.completed_at ? new Date(row.completed_at as string) : null,
      exercises: exercises
        .map((e) => {
          const sets = (e.workout_sets as Array<Record<string, unknown>>) ?? [];
          return {
            id: e.id as string,
            exerciseName: e.exercise_name as string,
            notes: e.notes as string | null,
            orderIndex: e.order_index as number,
            sets: sets
              .map((s) => {
                const setId = (s.id as string) || (s.set_id as string)
                if (!setId || typeof setId !== 'string' || setId.length < 10) {
                  return null
                }
                const reps = s.reps;
                const weightKg = s.weight_kg;
                return {
                  id: setId,
                  setNumber: Number(s.set_number),
                  reps: reps !== null && reps !== undefined && reps !== '' ? Number(reps) : null,
                  weightKg: weightKg !== null && weightKg !== undefined && weightKg !== '' ? Number(weightKg) : null,
                  restSeconds: s.rest_seconds !== null && s.rest_seconds !== undefined ? Number(s.rest_seconds) : null,
                  notes: s.notes as string | null,
                };
              })
              .filter((s): s is NonNullable<typeof s> => s !== null)
              .sort((a, b) => a.setNumber - b.setNumber),
          };
        })
        .sort((a, b) => a.orderIndex - b.orderIndex),
    };
  }

  return {
    fetchWorkouts,
    getWorkoutById,
    getInProgressWorkout,
    createWorkout,
    addExercise,
    addSet,
    updateSet,
    deleteSet,
    completeWorkout,
    deleteWorkout,
    getWeeklyStats,
  };
}
