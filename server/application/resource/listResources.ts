import type { ResourceRepository } from "../../domain/resource/ResourceRepository";

export async function listResources(resourceRepository: ResourceRepository) {
  return resourceRepository.list();
}
