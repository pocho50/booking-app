import { getResourceById } from "../../application/resource/getResourceById";
import { PrismaResourceRepository } from "../../infrastructure/prisma/PrismaResourceRepository";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "id is required" });
  }

  const repo = new PrismaResourceRepository();
  const resource = await getResourceById(repo, id);

  if (!resource) {
    throw createError({ statusCode: 404, statusMessage: "Resource not found" });
  }

  return resource;
});
