import type {
  ResourceCreateInput,
  ResourceDto,
  ResourceUpdateInput,
} from "../../shared/types/resource";

export type { ResourceCreateInput, ResourceDto, ResourceUpdateInput };

export async function listResources(): Promise<ResourceDto[]> {
  return $fetch<ResourceDto[]>("/api/resources");
}

export async function getResource(id: string): Promise<ResourceDto> {
  return $fetch<ResourceDto>(`/api/resources/${id}`);
}

export async function createResource(
  data: ResourceCreateInput
): Promise<ResourceDto> {
  return $fetch<ResourceDto>("/api/resources", {
    method: "POST",
    body: data,
  });
}

export async function updateResource(
  id: string,
  data: ResourceUpdateInput
): Promise<ResourceDto> {
  return $fetch<ResourceDto>(`/api/resources/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteResource(id: string): Promise<void> {
  await $fetch<void>(`/api/resources/${id}`, {
    method: "DELETE",
  });
}
