import type { User } from "../../domain/user/User";
import type { User as PrismaUser } from "#prisma-client";
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
}
