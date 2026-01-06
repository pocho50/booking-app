import type { ClientRepository } from "../../domain/client/ClientRepository";
import type { ClientUpdateInput } from "../../../shared/types/client";

export async function updateClient(
  clientRepository: ClientRepository,
  id: string,
  data: ClientUpdateInput
) {
  return clientRepository.update(id, data);
}
