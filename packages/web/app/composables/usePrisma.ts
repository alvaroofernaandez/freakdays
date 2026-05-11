let prismaInstance: any = null;

export async function usePrisma() {
  if (process.client || typeof window !== "undefined") {
    throw new Error("PrismaClient can only be used on the server side");
  }

  if (prismaInstance) return prismaInstance;

  const prismaModule = await import("@prisma/client");
  const { PrismaClient } = prismaModule;

  const config = useRuntimeConfig();
  const databaseUrl =
    (config.public.databaseUrl as string) ||
    (typeof process !== "undefined" ? process.env.DATABASE_URL : undefined);

  if (!databaseUrl) {
    throw new Error("Missing DATABASE_URL environment variable");
  }

  prismaInstance = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  return prismaInstance;
}

