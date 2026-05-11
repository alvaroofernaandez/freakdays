import { getPrisma } from "../../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const exerciseId = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!exerciseId) {
    throw createError({
      statusCode: 400,
      message: "Exercise ID is required",
    });
  }

  try {
    const prisma = await getPrisma();
    
    const exercise = await prisma.workoutExercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw createError({
        statusCode: 404,
        message: "Exercise not found",
      });
    }

    const existingSets = await prisma.workoutSet.findMany({
      where: { exerciseId },
      orderBy: { setNumber: "desc" },
      take: 1,
    });

    const nextSetNumber = existingSets.length > 0
      ? existingSets[0].setNumber + 1
      : 1;

    const data = await prisma.workoutSet.create({
      data: {
        exerciseId,
        setNumber: nextSetNumber,
        reps: body.reps || null,
        weightKg: body.weight_kg ? body.weight_kg : null,
        restSeconds: body.rest_seconds || null,
        notes: body.notes?.trim() || null,
      },
    });

    return {
      id: data.id,
      set_number: data.setNumber,
      reps: data.reps,
      weight_kg: data.weightKg !== null && data.weightKg !== undefined ? Number(data.weightKg.toString()) : null,
      rest_seconds: data.restSeconds,
      notes: data.notes,
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: "Error adding set",
    });
  }
});

