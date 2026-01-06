import type { ClientRepository } from "../../domain/client/ClientRepository";

export async function listClients(clientRepository: ClientRepository) {
  return clientRepository.list();
}
