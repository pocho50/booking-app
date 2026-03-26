import type { UserRepository } from "../../domain/user/UserRepository";

export async function deleteUser(
  userRepository: UserRepository,
  id: string
) {
  return userRepository.delete(id);
}
