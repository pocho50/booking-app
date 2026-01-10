export type ResourceDto = {
  id: string;
  name: string;
  description: string;
};

export type ResourceCreateInput = Omit<ResourceDto, "id">;

export type ResourceUpdateInput = Partial<ResourceCreateInput>;
