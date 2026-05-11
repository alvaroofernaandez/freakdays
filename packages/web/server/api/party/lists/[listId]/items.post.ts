import { PrismaClient } from "@prisma/client";
import { defineEventHandler, getRouterParam, readBody } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const listId = getRouterParam(event, "listId");
  if (!listId) {
    throw createError({ statusCode: 400, message: "List ID required" });
  }

  const body = await readBody(event);
  // body follows PartyAnimeItem structure but usually comes from AnimeMarketplace (AnimeSearchResult)
  // We need to map it.

  // Check access first
  const list = await prisma.partySharedList.findUnique({
    where: { id: listId },
    select: { partyId: true },
  });

  if (!list) {
    throw createError({ statusCode: 404, message: "List not found" });
  }

  const membership = await prisma.partyMember.findUnique({
    where: {
      partyId_userId: {
        partyId: list.partyId,
        userId: user.id,
      },
    },
  });

  if (!membership) {
    throw createError({ statusCode: 403, message: "Access denied" });
  }

  // Create item
  const item = await prisma.partyAnimeItem.create({
    data: {
      listId,
      title: body.title,
      status: body.status || "plan_to_watch",
      currentEpisode: body.current_episode || 0,
      totalEpisodes: body.episodes || null,
      score: body.score || null,
      coverUrl: body.images?.jpg?.large_image_url || body.cover_url,
      startDate: body.start_date || null,
      endDate: body.end_date || null,
      notes: body.synopsis ? `Sinopsis: ${body.synopsis}` : null,
      addedBy: user.id,
    },
    include: {
      addedByUser: {
        select: { username: true, displayName: true, avatarUrl: true },
      },
    },
  });

  return item;
});
