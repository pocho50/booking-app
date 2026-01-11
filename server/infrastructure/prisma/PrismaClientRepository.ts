import type { Client } from "../../domain/client/Client";
import type { Client as PrismaClientModel } from "#prisma-client";
import type {
  ClientCreateInput,
  ClientUpdateInput,
} from "../../../shared/types/client";
import type { ClientRepository } from "../../domain/client/ClientRepository";
import { prisma } from "../../utils/db";

function toDomainClient(dbClient: PrismaClientModel): Client {
  return {
    id: dbClient.id,
    name: dbClient.name,
    last_name: dbClient.last_name,
    doc: dbClient.doc,
    email: dbClient.email,
    address: dbClient.address,
    country: dbClient.country,
    state: dbClient.state,
    phone: dbClient.phone,
  };
}

export class PrismaClientRepository implements ClientRepository {
  async list(): Promise<Client[]> {
    const clients = await prisma.client.findMany({
      orderBy: { last_name: "asc" },
    });

    return clients.map(toDomainClient);
  }

  async getById(id: string): Promise<Client | null> {
    const client = await prisma.client.findUnique({ where: { id } });
    return client ? toDomainClient(client) : null;
  }

  async create(data: ClientCreateInput): Promise<Client> {
    const client = await prisma.client.create({ data });
    return toDomainClient(client);
  }

  async update(id: string, data: ClientUpdateInput): Promise<Client> {
    const client = await prisma.client.update({ where: { id }, data });
    return toDomainClient(client);
  }
}
