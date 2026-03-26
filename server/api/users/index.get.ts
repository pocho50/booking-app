import { listUsers } from "../../application/user/listUsers";
import { PrismaUserRepository } from "../../infrastructure/prisma/PrismaUserRepository";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const repo = new PrismaUserRepository();
  const users = await listUsers(repo);

  return users.map(({ password, ...user }) => user);
});
