import type { Client } from "./Client";
import type {
  ClientCreateInput,
  ClientListItemDto,
  ClientUpdateInput,
} from "../../../shared/types/client";

export interface ClientRepository {
  list(): Promise<Client[]>;
  listWithSaldo(): Promise<ClientListItemDto[]>;
  getById(id: string): Promise<Client | null>;
  create(data: ClientCreateInput): Promise<Client>;
  update(id: string, data: ClientUpdateInput): Promise<Client>;
}
