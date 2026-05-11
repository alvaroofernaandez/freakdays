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
    await prisma.workout.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Error deleting workout",
    });
  }
});

