import type {
  ClientCreateInput,
  ClientDto,
  ClientListItemDto,
  ClientUpdateInput,
} from "../../shared/types/client";

export type {
  ClientCreateInput,
  ClientDto,
  ClientListItemDto,
  ClientUpdateInput,
};

export async function listClients(): Promise<ClientListItemDto[]> {
  const { $api } = useNuxtApp();

  return $api<ClientListItemDto[]>("/clients");
}

export async function getClient(id: string): Promise<ClientDto> {
  const { $api } = useNuxtApp();

  return $api<ClientDto>(`/clients/${id}`);
}

export async function createClient(
  data: ClientCreateInput,
): Promise<ClientDto> {
  const { $api } = useNuxtApp();

  return $api<ClientDto>("/clients", {
    method: "POST",
    body: data,
  });
}

export async function updateClient(
  id: string,
  data: ClientUpdateInput,
): Promise<ClientDto> {
  const { $api } = useNuxtApp();

  return $api<ClientDto>(`/clients/${id}`, {
    method: "PUT",
    body: data,
  });
}
