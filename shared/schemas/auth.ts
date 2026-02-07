import * as z from "zod";

import { requiredString } from "./helpers";

export const loginSchema = z.object({
  username: requiredString("El usuario es obligatorio"),
  password: requiredString("La contraseña es obligatoria"),
});

export type LoginSchema = z.output<typeof loginSchema>;
