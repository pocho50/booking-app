import { getUserById } from "../../application/user/getUserById";
import { PrismaUserRepository } from "../../infrastructure/prisma/PrismaUserRepository";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "id is required" });
  }

  const repo = new PrismaUserRepository();
  const user = await getUserById(repo, id);

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  const { password, ...dto } = user;
  return dto;
});
