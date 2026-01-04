import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

const nodeEnv = (
  globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } }
).process?.env?.NODE_ENV;

if (nodeEnv !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
