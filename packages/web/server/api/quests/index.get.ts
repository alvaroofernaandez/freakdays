import type { Quest } from "@prisma/client";
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
    const data = await prisma.quest.findMany({
      where: {
        userId,
        active: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return data.map((row: Quest) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      difficulty: row.difficulty,
      expReward: row.expReward,
      dueDate: row.dueDate,
      dueTime: row.dueTime,
      reminderMinutesBefore: row.reminderMinutesBefore,
      createdAt: row.createdAt,
    }));
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Error fetching quests",
    });
  }
});

