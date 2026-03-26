import type { User } from "../../domain/user/User";
import type { User as PrismaUser } from "#prisma-client";
import type {
  UserCreateInput,
  UserUpdateInput,
} from "../../../shared/types/user";
import type { UserRepository } from "../../domain/user/UserRepository";
import { prisma } from "../../utils/db";

function toDomainUser(dbUser: PrismaUser): User {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    password: dbUser.password,
    role: dbUser.role,
  };
}

export class PrismaUserRepository implements UserRepository {
  async findByLogin(login: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: login }, { name: login }],
      },
    });

    return user ? toDomainUser(user) : null;
  }

  async list(): Promise<User[]> {
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
    });

    return users.map(toDomainUser);
  }

  async getById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? toDomainUser(user) : null;
  }

  async create(data: UserCreateInput): Promise<User> {
    const hashedPassword = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
    return toDomainUser(user);
  }

  async update(id: string, data: UserUpdateInput): Promise<User> {
    const updateData = { ...data };
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    return toDomainUser(user);
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }
}
