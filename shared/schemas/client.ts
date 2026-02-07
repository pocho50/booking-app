import * as z from "zod";

import { requiredEmail, requiredString } from "./helpers";

export const clientCreateSchema = z.object({
  name: requiredString("El nombre es obligatorio"),
  last_name: requiredString("El apellido es obligatorio"),
  doc: requiredString("El documento es obligatorio"),
  email: requiredEmail(),
  address: requiredString("La dirección es obligatoria"),
  country: requiredString("El país es obligatorio"),
  state: requiredString("El estado es obligatorio"),
  phone: requiredString("El teléfono es obligatorio"),
});

export const clientUpdateSchema = clientCreateSchema.partial();

export type ClientCreateSchema = z.output<typeof clientCreateSchema>;
export type ClientUpdateSchema = z.output<typeof clientUpdateSchema>;
