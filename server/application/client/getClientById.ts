import type { ClientRepository } from "../../domain/client/ClientRepository";

export async function getClientById(
  clientRepository: ClientRepository,
  id: string
) {
  return clientRepository.getById(id);
}
