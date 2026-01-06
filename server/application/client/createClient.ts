import type { ClientRepository } from "../../domain/client/ClientRepository";
import type { ClientCreateInput } from "../../../shared/types/client";

export async function createClient(
  clientRepository: ClientRepository,
  data: ClientCreateInput
) {
  return clientRepository.create(data);
}
