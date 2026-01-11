import { deleteResource } from "../../application/resource/deleteResource";
import { PrismaResourceRepository } from "../../infrastructure/prisma/PrismaResourceRepository";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "id is required" });
  }

  const repo = new PrismaResourceRepository();
  await deleteResource(repo, id);

  setResponseStatus(event, 204);
  return null;
});
