import type { User } from "./User";
import type {
  UserCreateInput,
  UserUpdateInput,
} from "../../../shared/types/user";

export interface UserRepository {
  findByLogin(login: string): Promise<User | null>;
  list(): Promise<User[]>;
  getById(id: string): Promise<User | null>;
  create(data: UserCreateInput): Promise<User>;
  update(id: string, data: UserUpdateInput): Promise<User>;
  delete(id: string): Promise<void>;
}
