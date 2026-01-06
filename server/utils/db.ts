import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "#prisma-client";

const prismaClientSingleton = () => {
  const databaseUrl = (
    globalThis as unknown as {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process?.env?.DATABASE_URL;

  const adapter = new PrismaBetterSqlite3({ url: databaseUrl ?? "" });

  return new PrismaClient({ adapter });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

const nodeEnv = (
  globalThis as unknown as {
    process?: { env?: Record<string, string | undefined> };
  }
).process?.env?.NODE_ENV;

if (nodeEnv !== "production") {
  globalForPrisma.prisma = prisma;
}
