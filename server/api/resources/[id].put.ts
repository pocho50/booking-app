import { createError, getRouterParam, readValidatedBody } from "h3";
import { updateResource } from "../../application/resource/updateResource";
import type { ResourceUpdateInput } from "../../../shared/types/resource";
import { resourceUpdateSchema } from "../../../shared/schemas/resource";
import { PrismaResourceRepository } from "../../infrastructure/prisma/PrismaResourceRepository";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "id is required" });
  }

  const result = await readValidatedBody(event, (body) =>
    resourceUpdateSchema.safeParse(body)
  );
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0]?.message || "Invalid body",
    });
  }

  const data: ResourceUpdateInput = result.data;

  const repo = new PrismaResourceRepository();
  const updated = await updateResource(repo, id, data);

  return updated;
});
