import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function getPrismaDatabaseUrl(url = process.env.DATABASE_URL) {
  if (!url || url.startsWith("file:")) return url;

  const databaseUrl = new URL(url);
  if (!databaseUrl.searchParams.has("connection_limit")) {
    databaseUrl.searchParams.set("connection_limit", "1");
  }
  if (!databaseUrl.searchParams.has("pool_timeout")) {
    databaseUrl.searchParams.set("pool_timeout", "20");
  }

  return databaseUrl.toString();
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: process.env.DATABASE_URL
      ? {
          db: {
            url: getPrismaDatabaseUrl(),
          },
        }
      : undefined,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

globalForPrisma.prisma = prisma;
