import type { Resource } from "../../domain/resource/Resource";
import type {
  ResourceCreateInput,
  ResourceUpdateInput,
} from "../../../shared/types/resource";
import type { ResourceRepository } from "../../domain/resource/ResourceRepository";
import { prisma } from "../../utils/db";

function toDomainResource(dbResource: any): Resource {
  return {
    id: dbResource.id,
    name: dbResource.name,
    description: dbResource.description,
  };
}

export class PrismaResourceRepository implements ResourceRepository {
  async list(): Promise<Resource[]> {
    const resources = await prisma.resource.findMany({
      orderBy: { name: "asc" },
    });

    return resources.map(toDomainResource);
  }

  async getById(id: string): Promise<Resource | null> {
    const resource = await prisma.resource.findUnique({ where: { id } });
    return resource ? toDomainResource(resource) : null;
  }

  async create(data: ResourceCreateInput): Promise<Resource> {
    const resource = await prisma.resource.create({ data });
    return toDomainResource(resource);
  }

  async update(id: string, data: ResourceUpdateInput): Promise<Resource> {
    const resource = await prisma.resource.update({ where: { id }, data });
    return toDomainResource(resource);
  }

  async delete(id: string): Promise<void> {
    await prisma.resource.delete({ where: { id } });
  }
}
