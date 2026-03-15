import type { Client } from "../../domain/client/Client";
import type { Client as PrismaClientModel } from "#prisma-client";
import type {
  ClientCreateInput,
  ClientListItemDto,
  ClientUpdateInput,
} from "../../../shared/types/client";
import type { ClientRepository } from "../../domain/client/ClientRepository";
import { prisma } from "../../utils/db";
import { calculateReservationSaldo } from "../../utils/reservationSaldo";

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

  async listWithSaldo(): Promise<ClientListItemDto[]> {
    const clients = await prisma.client.findMany({
      orderBy: { last_name: "asc" },
      include: {
        reservations: {
          where: { active: true },
          select: {
            price: true,
            payments: { select: { amount: true } },
          },
        },
      },
    });

    return clients.map((c) => {
      const saldo = c.reservations.reduce((acc, r) => {
        return acc + calculateReservationSaldo(r.price, r.payments);
      }, 0);

      return {
        id: c.id,
        name: c.name,
        last_name: c.last_name,
        doc: c.doc,
        email: c.email,
        address: c.address,
        country: c.country,
        state: c.state,
        phone: c.phone,
        saldo,
      };
    });
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
