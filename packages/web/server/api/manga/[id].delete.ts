import { getPrisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Manga ID is required",
    });
  }

  try {
    const prisma = await getPrisma();
    await prisma.mangaEntry.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Error deleting manga entry",
    });
  }
});

