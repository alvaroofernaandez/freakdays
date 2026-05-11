import type { AnimeEntry } from "@prisma/client";
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
    const data = await prisma.animeEntry.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return data.map((row: AnimeEntry) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      currentEpisode: row.currentEpisode,
      totalEpisodes: row.totalEpisodes,
      score: row.score,
      notes: row.notes,
      coverUrl: row.coverUrl,
      startDate: row.startDate,
      endDate: row.endDate,
      rewatchCount: row.rewatchCount,
    }));
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Error fetching anime list",
    });
  }
});
