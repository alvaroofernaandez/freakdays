import { getPrisma } from "../../../utils/prisma";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default defineEventHandler(async (event) => {
  const setId = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!setId) {
    throw createError({
      statusCode: 400,
      message: "Set ID is required",
    });
  }

  if (!UUID_REGEX.test(setId)) {
    throw createError({
      statusCode: 400,
      message: "Invalid set ID format",
    });
  }

  try {
    const prisma = await getPrisma();
    
    const existingSet = await prisma.workoutSet.findUnique({
      where: { id: setId },
    });

    if (!existingSet) {
      throw createError({
        statusCode: 404,
        message: "Set not found",
      });
    }

    const updateData: {
      reps?: number | null;
      weightKg?: number | null;
      restSeconds?: number | null;
      notes?: string | null;
    } = {};

    if (body.reps !== undefined) {
      updateData.reps = body.reps === null || body.reps === '' ? null : Number(body.reps);
    }
    if (body.weight_kg !== undefined) {
      updateData.weightKg = body.weight_kg === null || body.weight_kg === '' ? null : Number(body.weight_kg);
    }
    if (body.rest_seconds !== undefined) {
      updateData.restSeconds = body.rest_seconds === null || body.rest_seconds === '' ? null : Number(body.rest_seconds);
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes?.trim() || null;
    }

    const data = await prisma.workoutSet.update({
      where: { id: setId },
      data: updateData,
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
    console.error("Error updating set:", error);
    throw createError({
      statusCode: 500,
      message: error.message || "Error updating set",
    });
  }
});

