import type { User } from "../../domain/user/User";
import type { UserRepository } from "../../domain/user/UserRepository";

type LoginResult = User | null;

type LoginInput = {
  login: string;
  password: string;
};

export async function loginUser(
  repo: UserRepository,
  input: LoginInput
): Promise<LoginResult> {
  const user = await repo.findByLogin(input.login);

  if (!user) {
    return null;
  }

  if (!(await verifyPassword(user.password, input.password))) {
    return null;
  }

  return user;
}
