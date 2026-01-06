import { createError, readValidatedBody, setResponseStatus } from "h3";
import { createClient } from "../../application/client/createClient";
import type { ClientCreateInput } from "../../../shared/types/client";
import { clientCreateSchema } from "../../../shared/schemas/client";
import { PrismaClientRepository } from "../../infrastructure/prisma/PrismaClientRepository";

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) =>
    clientCreateSchema.safeParse(body)
  );
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0]?.message || "Invalid body",
    });
  }

  const data: ClientCreateInput = result.data;

  const repo = new PrismaClientRepository();
  const created = await createClient(repo, data);

  setResponseStatus(event, 201);
  return created;
});
