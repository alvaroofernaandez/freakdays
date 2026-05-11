import { getPrisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.userId) {
    throw createError({
      statusCode: 400,
      message: "User ID is required",
    });
  }

  if (!body.name || !body.name.trim()) {
    throw createError({
      statusCode: 400,
      message: "Workout name is required",
    });
  }

  try {
    const prisma = await getPrisma();
    const status = body.status || "in_progress";
    const now = new Date();

    const data = await prisma.workout.create({
      data: {
        userId: body.userId,
        name: body.name.trim(),
        description: body.description?.trim() || null,
        workoutDate: new Date(body.workout_date),
        durationMinutes: body.duration_minutes || null,
        status: status,
        startedAt: status === "in_progress" ? now : null,
      },
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
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Error creating workout",
    });
  }
});

