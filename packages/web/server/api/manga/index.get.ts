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
    const data = await prisma.mangaEntry.findMany({
      where: {
        userId,
      },
      orderBy: {
        title: "asc",
      },
    });

    return data.map((row) => ({
      id: row.id,
      title: row.title,
      author: row.author,
      totalVolumes: row.totalVolumes,
      ownedVolumes: row.ownedVolumes,
      status: row.status,
      score: row.score,
      notes: row.notes,
      coverUrl: row.coverUrl,
      pricePerVolume: row.pricePerVolume,
      totalCost: row.totalCost,
    }));
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Error fetching manga collection",
    });
  }
});

