import { getPrisma } from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const workoutId = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!workoutId) {
    throw createError({
      statusCode: 400,
      message: "Workout ID is required",
    });
  }

  if (!body.exercise_name || !body.exercise_name.trim()) {
    throw createError({
      statusCode: 400,
      message: "Exercise name is required",
    });
  }

  try {
    const prisma = await getPrisma();
    
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
      include: {
        exercises: true,
      },
    });

    if (!workout) {
      throw createError({
        statusCode: 404,
        message: "Workout not found",
      });
    }

    const data = await prisma.workoutExercise.create({
      data: {
        workoutId,
        exerciseName: body.exercise_name.trim(),
        notes: body.notes?.trim() || null,
        orderIndex: workout.exercises.length,
      },
    });

    return {
      id: data.id,
      exercise_name: data.exerciseName,
      notes: data.notes,
      order_index: data.orderIndex,
      workout_sets: [],
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: "Error adding exercise",
    });
  }
});

