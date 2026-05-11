import { PrismaClient } from "@prisma/client";
import { defineEventHandler, getRouterParam } from "h3";

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

  // Fetch list with party info
  const list = await prisma.partySharedList.findUnique({
    where: { id: listId },
    include: {
      party: {
        select: { id: true },
      },
      creator: {
        select: {
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      // Include specific items if anime
      animeItems: {
        include: {
          addedByUser: {
            select: {
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!list) {
    throw createError({ statusCode: 404, message: "List not found" });
  }

  // Check party membership
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

  return list;
});
