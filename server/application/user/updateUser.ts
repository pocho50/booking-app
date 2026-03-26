import type { UserRepository } from "../../domain/user/UserRepository";
import type { UserUpdateInput } from "../../../shared/types/user";

export async function updateUser(
  userRepository: UserRepository,
  id: string,
  data: UserUpdateInput
) {
  return userRepository.update(id, data);
}
