import { loginSchema, type LoginSchema } from "../../../shared/schemas/auth";
import type { UserDto } from "../../../shared/types/user";
import { loginUser } from "../../application/auth/loginUser";
import { PrismaUserRepository } from "../../infrastructure/prisma/PrismaUserRepository";

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) =>
    loginSchema.safeParse(body)
  );

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0]?.message || "Invalid body",
    });
  }

  const { username, password } = result.data as LoginSchema;
  const repo = new PrismaUserRepository();
  const user = await loginUser(repo, { login: username, password });

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Credenciales inválidas",
    });
  }

  const response: UserDto = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  await setUserSession(event, {
    user: response,
  });

  return response;
});
