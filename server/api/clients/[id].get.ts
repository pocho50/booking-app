import { getClientById } from "../../application/client/getClientById";
import { PrismaClientRepository } from "../../infrastructure/prisma/PrismaClientRepository";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "id is required" });
  }

  const repo = new PrismaClientRepository();
  const client = await getClientById(repo, id);

  if (!client) {
    throw createError({ statusCode: 404, statusMessage: "Client not found" });
  }

  return client;
});
