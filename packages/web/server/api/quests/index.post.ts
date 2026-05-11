import type { Quest } from "@prisma/client";
import { getPrisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.userId) {
    throw createError({
      statusCode: 400,
      message: "User ID is required",
    });
  }

  if (!body.title || !body.title.trim()) {
    throw createError({
      statusCode: 400,
      message: "Title is required",
    });
  }

  try {
    const prisma = await getPrisma();
    const data = await prisma.quest.create({
      data: {
        userId: body.userId,
        title: body.title.trim(),
        description: body.description || null,
        difficulty: body.difficulty,
        expReward: body.exp_reward,
        isRecurring: body.is_recurring ?? false,
        recurrencePattern: body.recurrence_pattern || null,
        dueDate: body.due_date ? new Date(body.due_date) : null,
        dueTime: body.due_time || null,
        reminderMinutesBefore: body.reminder_minutes_before || null,
      },
    });

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      expReward: data.expReward,
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      reminderMinutesBefore: data.reminderMinutesBefore,
      createdAt: data.createdAt,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Error creating quest",
    });
  }
});

