import { listClients } from "../../application/client/listClients";
import { PrismaClientRepository } from "../../infrastructure/prisma/PrismaClientRepository";

export default defineEventHandler(async () => {
  const repo = new PrismaClientRepository();
  return listClients(repo);
});
