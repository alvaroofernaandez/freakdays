import { getPrisma } from "../../utils/prisma";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "User ID is required",
    });
  }

  try {
    const prisma = await getPrisma();
    const updateData: {
      username?: string;
      displayName?: string;
      avatarUrl?: string;
      bannerUrl?: string;
      bio?: string;
      favoriteAnimeId?: string | null;
      favoriteMangaId?: string | null;
      location?: string | null;
      website?: string | null;
      socialLinks?: Record<string, string>;
    } = {};

    if (body.username !== undefined) updateData.username = body.username;
    if (body.display_name !== undefined) updateData.displayName = body.display_name;
    if (body.avatar_url !== undefined) updateData.avatarUrl = body.avatar_url;
    if (body.banner_url !== undefined) updateData.bannerUrl = body.banner_url;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.favorite_anime_id !== undefined) updateData.favoriteAnimeId = body.favorite_anime_id;
    if (body.favorite_manga_id !== undefined) updateData.favoriteMangaId = body.favorite_manga_id;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.social_links !== undefined) updateData.socialLinks = body.social_links;

    await prisma.profile.update({
      where: { id },
      data: updateData,
    });

    return { success: true };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Error updating profile",
    });
  }
});

