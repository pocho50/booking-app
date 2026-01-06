import type {
  ClientCreateInput,
  ClientDto,
  ClientUpdateInput,
} from "../../shared/types/client";

export type { ClientCreateInput, ClientDto, ClientUpdateInput };

export async function listClients(): Promise<ClientDto[]> {
  return $fetch<ClientDto[]>("/api/clients");
}

export async function getClient(id: string): Promise<ClientDto> {
  return $fetch<ClientDto>(`/api/clients/${id}`);
}

export async function createClient(
  data: ClientCreateInput
): Promise<ClientDto> {
  return $fetch<ClientDto>("/api/clients", {
    method: "POST",
    body: data,
  });
}

export async function updateClient(
  id: string,
  data: ClientUpdateInput
): Promise<ClientDto> {
  return $fetch<ClientDto>(`/api/clients/${id}`, {
    method: "PUT",
    body: data,
  });
}
