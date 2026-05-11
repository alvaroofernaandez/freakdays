import { getPrisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Quest ID is required",
    });
  }

  try {
    const prisma = await getPrisma();
    const updateData: {
      active?: boolean;
    } = {};

    if (body.active !== undefined) updateData.active = body.active;

    await prisma.quest.update({
      where: { id },
      data: updateData,
    });

    return { success: true };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Error updating quest",
    });
  }
});

