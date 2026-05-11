import type { QuestNotification } from "@prisma/client";
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
    const data = await prisma.questNotification.findMany({
      where: {
        userId,
      },
      orderBy: {
        sentAt: "desc",
      },
      take: 50,
    });

    return data.map((n: QuestNotification) => ({
      id: n.id,
      quest_id: n.questId,
      notification_type: n.notificationType as 'overdue' | 'reminder' | 'due_soon',
      message: n.message,
      sent_at: n.sentAt,
      read_at: n.readAt,
    }));
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Error fetching notifications",
    });
  }
});

