import * as z from "zod";

import { requiredEmail, requiredString } from "./helpers";

export const userCreateSchema = z.object({
  name: requiredString("El nombre es obligatorio"),
  email: requiredEmail(),
  password: requiredString("La contraseña es obligatoria"),
  role: z.enum(["USER", "ADMIN"], {
    message: "El rol es obligatorio",
  }),
});

export const userUpdateSchema = userCreateSchema.partial();

export type UserCreateSchema = z.output<typeof userCreateSchema>;
export type UserUpdateSchema = z.output<typeof userUpdateSchema>;
