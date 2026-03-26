import { updateUser } from "../../application/user/updateUser";
import type { UserUpdateInput } from "../../../shared/types/user";
import { userUpdateSchema } from "../../../shared/schemas/user";
import { PrismaUserRepository } from "../../infrastructure/prisma/PrismaUserRepository";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "id is required" });
  }

  const result = await readValidatedBody(event, (body) =>
    userUpdateSchema.safeParse(body)
  );
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0]?.message || "Invalid body",
    });
  }

  const data: UserUpdateInput = result.data;

  const repo = new PrismaUserRepository();
  const updated = await updateUser(repo, id, data);

  const { password, ...dto } = updated;
  return dto;
});
