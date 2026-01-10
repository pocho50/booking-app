import { listResources } from "../../application/resource/listResources";
import { PrismaResourceRepository } from "../../infrastructure/prisma/PrismaResourceRepository";

export default defineEventHandler(async () => {
  const repo = new PrismaResourceRepository();
  const resources = await listResources(repo);

  return resources;
});
