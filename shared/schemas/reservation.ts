import * as z from "zod";

function requiredString(message: string) {
  return z.preprocess(
    (value) => (typeof value === "string" ? value : ""),
    z.string().min(1, message)
  );
}

function coerceBoolean(value: unknown) {
  if (value === false || value === 0 || value === "0") {
    return false;
  }
  if (value === true || value === 1 || value === "1") {
    return true;
  }
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (v === "false" || v === "no" || v === "off") {
      return false;
    }
    if (v === "true" || v === "yes" || v === "on") {
      return true;
    }
  }
  return Boolean(value);
}

const isoDateString = (message: string) =>
  z
    .preprocess(
      (value) => (typeof value === "string" ? value : ""),
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, message)
    )
    .transform((v) => v);

const reservationBaseSchema = z.object({
  start_date: isoDateString("La fecha desde es obligatoria"),
  end_date: isoDateString("La fecha hasta es obligatoria"),
  id_resource: requiredString("El recurso es obligatorio"),
  id_client: z.preprocess(
    (v) => (typeof v === "string" && v.length > 0 ? v : null),
    z.string().nullable()
  ),
  observation: z
    .preprocess(
      (v) => (typeof v === "string" ? v : undefined),
      z.string().optional()
    )
    .optional(),
  price: z.preprocess(
    (v) => (typeof v === "number" ? v : Number(v)),
    z.number().finite("Precio inválido").min(0, "El precio debe ser >= 0")
  ),
  confirmed: z.preprocess(coerceBoolean, z.boolean()).default(false),
  active: z.preprocess(coerceBoolean, z.boolean()).default(true),
});

export const reservationCreateSchema = reservationBaseSchema.superRefine(
  (data, ctx) => {
    if (data.start_date && data.end_date && data.start_date > data.end_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha hasta no puede ser menor que la fecha desde",
        path: ["end_date"],
      });
    }

    if (data.active !== false && !data.id_client) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El cliente es obligatorio",
        path: ["id_client"],
      });
    }
  }
);

export const reservationUpdateSchema = reservationBaseSchema
  .partial()
  .superRefine((data, ctx) => {
    if (data.start_date && data.end_date && data.start_date > data.end_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha hasta no puede ser menor que la fecha desde",
        path: ["end_date"],
      });
    }

    if (data.active !== false) {
      if (data.id_client === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El cliente es obligatorio",
          path: ["id_client"],
        });
      }
    }
  });

export const reservationCreateSchemaWithClientRule = reservationCreateSchema;

export type ReservationCreateSchema = z.output<typeof reservationCreateSchema>;
export type ReservationUpdateSchema = z.output<typeof reservationUpdateSchema>;
