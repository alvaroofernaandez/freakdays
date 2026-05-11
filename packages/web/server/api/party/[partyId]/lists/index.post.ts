import { PrismaClient } from "@prisma/client";
import { defineEventHandler, getRouterParam, readBody } from "h3";

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

  const body = await readBody(event);
  const { name, listType } = body;

  if (!name || !listType) {
    throw createError({
      statusCode: 400,
      message: "Name and Type are required",
    });
  }

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

  const list = await prisma.partySharedList.create({
    data: {
      partyId,
      name,
      listType,
      createdBy: user.id,
      content: listType === "tier_list" ? { tiers: [], pool: [] } : undefined,
    },
  });

  return list;
});
