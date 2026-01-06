import type { Client } from "./Client";
import type {
  ClientCreateInput,
  ClientUpdateInput,
} from "../../../shared/types/client";

export interface ClientRepository {
  list(): Promise<Client[]>;
  getById(id: string): Promise<Client | null>;
  create(data: ClientCreateInput): Promise<Client>;
  update(id: string, data: ClientUpdateInput): Promise<Client>;
}
