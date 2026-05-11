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
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const workouts = await prisma.workout.findMany({
      where: {
        userId,
        workoutDate: {
          gte: weekAgo,
        },
      },
      select: {
        durationMinutes: true,
      },
    });

    return {
      count: workouts.length,
      totalMinutes: workouts.reduce(
        (sum, w) => sum + (w.durationMinutes || 0),
        0
      ),
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Error fetching weekly stats",
    });
  }
});

