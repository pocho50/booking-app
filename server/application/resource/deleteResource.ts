import type { ResourceRepository } from "../../domain/resource/ResourceRepository";

export async function deleteResource(
  resourceRepository: ResourceRepository,
  id: string
) {
  return resourceRepository.delete(id);
}
