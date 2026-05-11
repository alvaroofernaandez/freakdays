import { getPrisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Anime ID is required",
    });
  }

  try {
    const prisma = await getPrisma();
    
    const updateData: {
      currentEpisode?: number;
      status?: string;
      score?: number;
      startDate?: Date | null;
      endDate?: Date | null;
      notes?: string | null;
    } = {};

    if (body.currentEpisode !== undefined) updateData.currentEpisode = body.currentEpisode;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.score !== undefined) updateData.score = body.score;
    if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const data = await prisma.animeEntry.update({
      where: { id },
      data: updateData,
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
      message: "Error updating anime entry",
    });
  }
});

