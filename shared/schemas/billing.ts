import * as z from "zod";

function requiredString(message: string) {
  return z.preprocess(
    (value) => (typeof value === "string" ? value : ""),
    z.string().min(1, message)
  );
}

const isoDateString = (message: string) =>
  z
    .preprocess(
      (value) => (typeof value === "string" ? value : ""),
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, message)
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
    .refine((n) => n >= 0, "El importe debe ser >= 0")
);

const billingBaseSchema = z.object({
  date: isoDateString("La fecha es obligatoria"),
  id_reservation: requiredString("La reserva es obligatoria"),
  amount: amountSchema,
  observations: z
    .preprocess(
      (v) => (typeof v === "string" ? v : undefined),
      z.string().optional()
    )
    .optional(),
});

export const billingCreateSchema = billingBaseSchema;

export const billingUpdateSchema = billingBaseSchema.partial();

export type BillingCreateSchema = z.output<typeof billingCreateSchema>;
export type BillingUpdateSchema = z.output<typeof billingUpdateSchema>;
