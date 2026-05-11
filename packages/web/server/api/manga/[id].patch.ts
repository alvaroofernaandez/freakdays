import { getPrisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Manga ID is required",
    });
  }

  try {
    const prisma = await getPrisma();
    
    const updateData: {
      ownedVolumes?: number[];
      totalCost?: number;
      status?: string;
      score?: number;
      pricePerVolume?: number | null;
    } = {};

    if (body.ownedVolumes !== undefined) updateData.ownedVolumes = body.ownedVolumes;
    if (body.totalCost !== undefined) updateData.totalCost = body.totalCost;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.score !== undefined) updateData.score = body.score;
    if (body.pricePerVolume !== undefined) updateData.pricePerVolume = body.pricePerVolume;

    const data = await prisma.mangaEntry.update({
      where: { id },
      data: updateData,
    });

    return {
      id: data.id,
      title: data.title,
      author: data.author,
      totalVolumes: data.totalVolumes,
      ownedVolumes: data.ownedVolumes,
      status: data.status,
      score: data.score,
      notes: data.notes,
      coverUrl: data.coverUrl,
      pricePerVolume: data.pricePerVolume,
      totalCost: data.totalCost,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Error updating manga entry",
    });
  }
});

