import * as z from "zod";

function requiredString(message: string) {
  return z.preprocess(
    (value) => (typeof value === "string" ? value : ""),
    z.string().min(1, message)
  );
}

export const loginSchema = z.object({
  username: requiredString("El usuario es obligatorio"),
  password: requiredString("La contraseña es obligatoria"),
});

export type LoginSchema = z.output<typeof loginSchema>;
