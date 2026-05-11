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
  // body can contain name, content

  // Check access
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

  // Update
  const updated = await prisma.partySharedList.update({
    where: { id: listId },
    data: {
      name: body.name,
      content: body.content, // Json
    },
  });

  return updated;
});
