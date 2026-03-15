import type {
  ResourceCreateInput,
  ResourceDto,
  ResourceUpdateInput,
} from "~~/shared/types/resource";

export type { ResourceCreateInput, ResourceDto, ResourceUpdateInput };

export async function listResources(): Promise<ResourceDto[]> {
  const { $api } = useNuxtApp();

  return $api<ResourceDto[]>("/resources");
}

export async function getResource(id: string): Promise<ResourceDto> {
  const { $api } = useNuxtApp();

  return $api<ResourceDto>(`/resources/${id}`);
}

export async function createResource(
  data: ResourceCreateInput,
): Promise<ResourceDto> {
  const { $api } = useNuxtApp();

  return $api<ResourceDto>("/resources", {
    method: "POST",
    body: data,
  });
}

export async function updateResource(
  id: string,
  data: ResourceUpdateInput,
): Promise<ResourceDto> {
  const { $api } = useNuxtApp();

  return $api<ResourceDto>(`/resources/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteResource(id: string): Promise<void> {
  const { $api } = useNuxtApp();

  await $api<void>(`/resources/${id}`, {
    method: "DELETE",
  });
}
