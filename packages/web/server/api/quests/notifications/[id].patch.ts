import { getPrisma } from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Notification ID is required",
    });
  }

  try {
    const prisma = await getPrisma();
    await prisma.questNotification.update({
      where: { id },
      data: { readAt: new Date() },
    });

    return { success: true };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Error marking notification as read",
    });
  }
});

