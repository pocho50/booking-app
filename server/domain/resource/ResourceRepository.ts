import type { Resource } from "./Resource";
import type {
  ResourceCreateInput,
  ResourceUpdateInput,
} from "../../../shared/types/resource";

export interface ResourceRepository {
  list(): Promise<Resource[]>;
  getById(id: string): Promise<Resource | null>;
  create(data: ResourceCreateInput): Promise<Resource>;
  update(id: string, data: ResourceUpdateInput): Promise<Resource>;
  delete(id: string): Promise<void>;
}
