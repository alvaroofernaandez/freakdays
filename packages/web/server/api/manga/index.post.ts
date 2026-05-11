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
    const data = await prisma.mangaEntry.create({
      data: {
        userId: body.userId,
        title: body.title.trim(),
        author: body.author || null,
        totalVolumes: body.total_volumes || null,
        status: body.status || "collecting",
        ownedVolumes: [],
        pricePerVolume: body.price_per_volume || null,
        totalCost: 0,
      },
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
      message: "Error creating manga entry",
    });
  }
});

