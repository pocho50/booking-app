import type { User } from "./User";

export interface UserRepository {
  findByLogin(login: string): Promise<User | null>;
}
