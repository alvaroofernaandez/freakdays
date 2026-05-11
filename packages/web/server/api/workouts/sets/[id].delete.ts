import { getPrisma } from "../../../utils/prisma";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default defineEventHandler(async (event) => {
  const setId = getRouterParam(event, "id");

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

    await prisma.workoutSet.delete({
      where: { id: setId },
    });

    return { success: true };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    console.error("Error deleting set:", error);
    throw createError({
      statusCode: 500,
      message: error.message || "Error deleting set",
    });
  }
});

