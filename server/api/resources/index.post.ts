import { createResource } from "../../application/resource/createResource";
import type { ResourceCreateInput } from "../../../shared/types/resource";
import { resourceCreateSchema } from "../../../shared/schemas/resource";
import { PrismaResourceRepository } from "../../infrastructure/prisma/PrismaResourceRepository";

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) =>
    resourceCreateSchema.safeParse(body)
  );
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0]?.message || "Invalid body",
    });
  }

  const data: ResourceCreateInput = result.data;

  const repo = new PrismaResourceRepository();
  const created = await createResource(repo, data);

  setResponseStatus(event, 201);
  return created;
});
