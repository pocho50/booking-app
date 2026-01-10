import type { ResourceRepository } from "../../domain/resource/ResourceRepository";
import type { ResourceUpdateInput } from "../../../shared/types/resource";

export async function updateResource(
  resourceRepository: ResourceRepository,
  id: string,
  data: ResourceUpdateInput
) {
  return resourceRepository.update(id, data);
}
