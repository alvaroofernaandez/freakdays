import { getPrisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const userId = getQuery(event).userId as string;

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: "User ID is required",
    });
  }

  try {
    const prisma = await getPrisma();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const data = await prisma.questCompletion.findMany({
      where: {
        userId,
        completedAt: {
          gte: today,
        },
      },
      select: {
        questId: true,
      },
    });

    return data.map((c) => c.questId);
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Error fetching today completions",
    });
  }
});

