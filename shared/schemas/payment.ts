import * as z from "zod";

function requiredString(message: string) {
  return z.preprocess(
    (value) => (typeof value === "string" ? value : ""),
    z.string().min(1, message),
  );
}

const isoDateString = (message: string) =>
  z
    .preprocess(
      (value) => (typeof value === "string" ? value : ""),
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, message),
    )
    .transform((v) => v);

const amountSchema = z.preprocess(
  (v) => {
    if (typeof v === "number") {
      return v;
    }
    if (typeof v === "string") {
      const trimmed = v.trim();
      if (!trimmed) {
        return Number.NaN;
      }
      return Number(trimmed);
    }
    return Number.NaN;
  },
  z
    .number()
    .refine((n) => Number.isFinite(n), "El importe es obligatorio")
    .refine((n) => n >= 0, "El importe debe ser >= 0"),
);

const paymentBaseSchema = z.object({
  date: isoDateString("La fecha es obligatoria"),
  id_reservation: requiredString("La reserva es obligatoria"),
  amount: amountSchema,
  observations: z
    .preprocess(
      (v) => (typeof v === "string" ? v : undefined),
      z.string().optional(),
    )
    .optional(),
});

export const paymentCreateSchema = paymentBaseSchema;

export const paymentCreateForReservationSchema = paymentBaseSchema.omit({
  id_reservation: true,
});

export const paymentUpdateSchema = paymentBaseSchema.partial();

export type PaymentCreateSchema = z.output<typeof paymentCreateSchema>;
export type PaymentUpdateSchema = z.output<typeof paymentUpdateSchema>;
