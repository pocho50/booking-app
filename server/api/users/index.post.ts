import { createUser } from "../../application/user/createUser";
import type { UserCreateInput } from "../../../shared/types/user";
import { userCreateSchema } from "../../../shared/schemas/user";
import { PrismaUserRepository } from "../../infrastructure/prisma/PrismaUserRepository";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const result = await readValidatedBody(event, (body) =>
    userCreateSchema.safeParse(body)
  );
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0]?.message || "Invalid body",
    });
  }

  const data: UserCreateInput = result.data;

  const repo = new PrismaUserRepository();
  const user = await createUser(repo, data);

  const { password, ...dto } = user;

  setResponseStatus(event, 201);
  return dto;
});
