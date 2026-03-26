import type { UserRepository } from "../../domain/user/UserRepository";

export async function listUsers(userRepository: UserRepository) {
  return userRepository.list();
}
