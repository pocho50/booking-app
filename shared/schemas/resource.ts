import * as z from "zod";

import { requiredString } from "./helpers";

export const resourceCreateSchema = z.object({
  name: requiredString("El nombre es obligatorio"),
  description: requiredString("La descripción es obligatoria"),
});

export const resourceUpdateSchema = resourceCreateSchema.partial();

export type ResourceCreateSchema = z.output<typeof resourceCreateSchema>;
export type ResourceUpdateSchema = z.output<typeof resourceUpdateSchema>;
