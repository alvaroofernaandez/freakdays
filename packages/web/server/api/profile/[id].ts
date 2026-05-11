import { getPrisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "User ID is required",
    });
  }

  try {
    const prisma = await getPrisma();
    const profile = await prisma.profile.findUnique({
      where: { id },
    });

    if (!profile) {
      throw createError({
        statusCode: 404,
        message: "Profile not found",
      });
    }

    return {
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      bannerUrl: profile.bannerUrl,
      totalExp: profile.totalExp,
      level: profile.level,
      bio: profile.bio,
      favoriteAnimeId: profile.favoriteAnimeId,
      favoriteMangaId: profile.favoriteMangaId,
      location: profile.location,
      website: profile.website,
      socialLinks: profile.socialLinks,
    };
  } catch (error: any) {
    console.error("Error in profile API:", error);
    throw createError({
      statusCode: 500,
      message: error?.message || "Error fetching profile",
      data: error,
    });
  }
});

