import type { ResourceRepository } from "../../domain/resource/ResourceRepository";
import type { ResourceCreateInput } from "../../../shared/types/resource";

export async function createResource(
  resourceRepository: ResourceRepository,
  data: ResourceCreateInput
) {
  return resourceRepository.create(data);
}
