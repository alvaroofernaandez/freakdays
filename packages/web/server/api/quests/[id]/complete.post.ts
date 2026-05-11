import { getPrisma } from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Quest ID is required",
    });
  }

  if (!body.userId) {
    throw createError({
      statusCode: 400,
      message: "User ID is required",
    });
  }

  try {
    const prisma = await getPrisma();
    const quest = await prisma.quest.findUnique({
      where: { id },
    });

    if (!quest) {
      throw createError({
        statusCode: 404,
        message: "Quest not found",
      });
    }

    const expEarned = quest.expReward;
    const streakCount = body.streakCount || 1;

    await prisma.$transaction(async (tx) => {
      await tx.questCompletion.create({
        data: {
          questId: id,
          userId: body.userId,
          expEarned,
          streakCount,
        },
      });

      await tx.profile.update({
        where: { id: body.userId },
        data: {
          totalExp: {
            increment: expEarned,
          },
        },
      });
    });

    return { expEarned };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Error completing quest",
    });
  }
});

