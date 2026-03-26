import type { UserRepository } from "../../domain/user/UserRepository";
import type { UserCreateInput } from "../../../shared/types/user";

export async function createUser(
  userRepository: UserRepository,
  data: UserCreateInput
) {
  return userRepository.create(data);
}
