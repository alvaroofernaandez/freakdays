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
    const data = await prisma.animeEntry.create({
      data: {
        userId: body.userId,
        title: body.title.trim(),
        status: body.status,
        totalEpisodes: body.total_episodes || null,
        score: body.score || null,
        coverUrl: body.cover_url || null,
        notes: body.notes || null,
        currentEpisode: 0,
      },
    });

    return {
      id: data.id,
      title: data.title,
      status: data.status,
      currentEpisode: data.currentEpisode,
      totalEpisodes: data.totalEpisodes,
      score: data.score,
      notes: data.notes,
      coverUrl: data.coverUrl,
      startDate: data.startDate,
      endDate: data.endDate,
      rewatchCount: data.rewatchCount,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Error creating anime entry",
    });
  }
});

