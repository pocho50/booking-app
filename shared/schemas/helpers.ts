import * as z from "zod";

export function requiredString(message: string) {
  return z.preprocess(
    (value) => (typeof value === "string" ? value : ""),
    z.string().min(1, message),
  );
}

export function requiredEmail(message = "El email es obligatorio") {
  return z.preprocess(
    (value) => (typeof value === "string" ? value : ""),
    z.string().min(1, message).email("Email inválido"),
  );
}
