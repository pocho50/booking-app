import { deleteUser } from "../../application/user/deleteUser";
import { PrismaUserRepository } from "../../infrastructure/prisma/PrismaUserRepository";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "id is required" });
  }

  const session = await requireUserSession(event);
  if (session.user.id === id) {
    throw createError({
      statusCode: 400,
      statusMessage: "No puedes eliminarte a ti mismo.",
    });
  }

  const repo = new PrismaUserRepository();
  await deleteUser(repo, id);

  setResponseStatus(event, 204);
  return null;
});
