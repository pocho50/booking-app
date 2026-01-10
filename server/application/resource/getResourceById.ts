import type { ResourceRepository } from "../../domain/resource/ResourceRepository";

export async function getResourceById(
  resourceRepository: ResourceRepository,
  id: string
) {
  return resourceRepository.getById(id);
}
