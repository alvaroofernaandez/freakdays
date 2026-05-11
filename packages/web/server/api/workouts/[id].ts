import { getPrisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Workout ID is required",
    });
  }

  try {
    const prisma = await getPrisma();
    const data = await prisma.workout.findUnique({
      where: { id },
      include: {
        exercises: {
          include: {
            sets: {
              orderBy: {
                setNumber: "asc",
              },
            },
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
      },
    });

    if (!data) {
      throw createError({
        statusCode: 404,
        message: "Workout not found",
      });
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      workout_date: data.workoutDate.toISOString().split("T")[0],
      duration_minutes: data.durationMinutes,
      notes: data.notes,
      status: data.status,
      started_at: data.startedAt?.toISOString() || null,
      completed_at: data.completedAt?.toISOString() || null,
      workout_exercises: data.exercises.map((exercise) => ({
        id: exercise.id,
        exercise_name: exercise.exerciseName,
        notes: exercise.notes,
        order_index: exercise.orderIndex,
        workout_sets: exercise.sets.map((set) => ({
          id: set.id,
          set_number: set.setNumber,
          reps: set.reps !== null && set.reps !== undefined ? Number(set.reps) : null,
          weight_kg: set.weightKg !== null && set.weightKg !== undefined ? Number(set.weightKg.toString()) : null,
          rest_seconds: set.restSeconds !== null && set.restSeconds !== undefined ? Number(set.restSeconds) : null,
          notes: set.notes,
        })),
      })),
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: "Error fetching workout",
    });
  }
});

