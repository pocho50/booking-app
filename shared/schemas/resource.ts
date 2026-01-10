import * as z from "zod";

function requiredString(message: string) {
  return z.preprocess(
    (value) => (typeof value === "string" ? value : ""),
    z.string().min(1, message)
  );
}

export const resourceCreateSchema = z.object({
  name: requiredString("El nombre es obligatorio"),
  description: requiredString("La descripción es obligatoria"),
});

export const resourceUpdateSchema = resourceCreateSchema.partial();

export type ResourceCreateSchema = z.output<typeof resourceCreateSchema>;
export type ResourceUpdateSchema = z.output<typeof resourceUpdateSchema>;
