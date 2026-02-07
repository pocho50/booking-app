import * as z from "zod";

import { requiredString } from "./helpers";

const isoDateString = (message: string) =>
  z
    .preprocess(
      (value) => (typeof value === "string" ? value : ""),
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, message),
    )
    .transform((v) => v);

const amountSchema = z
  .number({ message: "El importe debe ser un número" })
  .refine((n) => n > 0, "El importe debe ser mayor a 0");

const paymentBaseSchema = z.object({
  date: isoDateString("La fecha es obligatoria"),
  id_reservation: requiredString("La reserva es obligatoria"),
  amount: amountSchema,
  observations: z.string().optional(),
});

export const paymentCreateSchema = paymentBaseSchema;

export const paymentCreateForReservationSchema = paymentBaseSchema.omit({
  id_reservation: true,
});

export const paymentUpdateSchema = paymentBaseSchema.partial();

export type PaymentCreateSchema = z.output<typeof paymentCreateSchema>;
export type PaymentUpdateSchema = z.output<typeof paymentUpdateSchema>;
