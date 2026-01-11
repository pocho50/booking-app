import { updateClient } from "../../application/client/updateClient";
import type { ClientUpdateInput } from "../../../shared/types/client";
import { clientUpdateSchema } from "../../../shared/schemas/client";
import { PrismaClientRepository } from "../../infrastructure/prisma/PrismaClientRepository";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "id is required" });
  }

  const result = await readValidatedBody(event, (body) =>
    clientUpdateSchema.safeParse(body)
  );
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0]?.message || "Invalid body",
    });
  }

  const data: ClientUpdateInput = result.data;

  const repo = new PrismaClientRepository();
  const updated = await updateClient(repo, id, data);

  return updated;
});
