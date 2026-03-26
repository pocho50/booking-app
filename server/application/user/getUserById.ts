import type { UserRepository } from "../../domain/user/UserRepository";

export async function getUserById(
  userRepository: UserRepository,
  id: string
) {
  return userRepository.getById(id);
}
