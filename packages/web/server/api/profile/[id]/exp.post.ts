import { getPrisma } from "../../../utils/prisma";

function calculateLevel(exp: number): number {
  return Math.floor(exp / 100) + 1;
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "User ID is required",
    });
  }

  if (typeof body.amount !== "number") {
    throw createError({
      statusCode: 400,
      message: "Amount is required and must be a number",
    });
  }

  try {
    const prisma = await getPrisma();
    const profile = await prisma.profile.findUnique({
      where: { id },
      select: { totalExp: true },
    });

    if (!profile) {
      throw createError({
        statusCode: 404,
        message: "Profile not found",
      });
    }

    const newTotal = profile.totalExp + body.amount;
    const newLevel = calculateLevel(newTotal);

    await prisma.profile.update({
      where: { id },
      data: { totalExp: newTotal, level: newLevel },
    });

    return { newTotal, newLevel };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Error adding exp",
    });
  }
});

