let prismaInstance: any = null;

export async function getPrisma() {
  if (typeof process === "undefined" || !process.env) {
    throw new Error("Prisma can only be used on the server");
  }

  if (prismaInstance) {
    return prismaInstance;
  }

  const { PrismaClient } = await import("@prisma/client").catch((error) => {
    console.error("Failed to import PrismaClient:", error);
    throw new Error(
      "PrismaClient could not be loaded. Make sure you're running on the server."
    );
  });

  let databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "Missing DATABASE_URL environment variable. Please set it in your .env file."
    );
  }

  if (databaseUrl.includes(":5432") && !databaseUrl.includes("pooler")) {
    console.warn(
      "⚠️  WARNING: Using direct connection (port 5432). Consider using connection pooler (port 6543) for better performance."
    );
    console.warn(
      "   Get the pooler URL from Supabase Dashboard → Settings → Database → Connection pooling → Transaction mode"
    );
  }

  prismaInstance = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

  return prismaInstance;
}
