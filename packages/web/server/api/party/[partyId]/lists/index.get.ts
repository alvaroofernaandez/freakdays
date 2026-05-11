import { PrismaClient } from "@prisma/client";
import { defineEventHandler, getRouterParam } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // Try to use Nuxt Supabase helper first
  let user;
  try {
    // @ts-ignore - Nuxt Supabase module provides this
    const supabase = serverSupabaseClient(event);
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
    if (!error && supabaseUser) {
      user = supabaseUser;
    }
  } catch {
    // Fallback to custom helper
    user = await serverSupabaseUser(event);
  }
  
  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const partyId = getRouterParam(event, "partyId");
  if (!partyId) {
    throw createError({ statusCode: 400, message: "Party ID required" });
  }

  // Verify access: User must be a member of the party
  const membership = await prisma.partyMember.findUnique({
    where: {
      partyId_userId: {
        partyId,
        userId: user.id,
      },
    },
  });

  if (!membership) {
    throw createError({
      statusCode: 403,
      message: "Not a member of this party",
    });
  }

  // Fetch lists
  const lists = await prisma.partySharedList.findMany({
    where: { partyId },
    include: {
      creator: {
        select: {
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: { animeItems: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return lists;
});
