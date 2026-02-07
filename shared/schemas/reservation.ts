import * as z from "zod";

import { requiredString } from "./helpers";

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
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, message),
    )
    .transform((v) => v);

const priceSchema = z.preprocess(
  (v) => {
    if (typeof v === "number") {
      return v;
    }
    if (typeof v === "string") {
      const trimmed = v.trim();
      if (!trimmed) {
        return undefined;
      }
      return Number(trimmed);
    }
    return undefined;
  },
  z
    .number()
    .optional()
    .refine((n) => n === undefined || Number.isFinite(n), "Precio inválido")
    .refine((n) => n === undefined || n >= 0, "El precio debe ser >= 0"),
);

const reservationBaseSchema = z.object({
  start_date: isoDateString("La fecha desde es obligatoria"),
  end_date: isoDateString("La fecha hasta es obligatoria"),
  id_resource: requiredString("El recurso es obligatorio"),
  id_client: z.preprocess(
    (v) => (typeof v === "string" && v.length > 0 ? v : null),
    z.string().nullable(),
  ),
  observation: z
    .preprocess(
      (v) => (typeof v === "string" ? v : undefined),
      z.string().optional(),
    )
    .optional(),
  price: priceSchema,
  confirmed: z.preprocess(coerceBoolean, z.boolean()).default(false),
  active: z.preprocess(coerceBoolean, z.boolean()).default(true),
});

export const reservationCreateSchema = reservationBaseSchema
  .superRefine((data, ctx) => {
    if (data.start_date && data.end_date && data.start_date > data.end_date) {
      ctx.addIssue({
        code: "custom",
        message: "La fecha hasta no puede ser menor que la fecha desde",
        path: ["end_date"],
      });
    }

    if (data.active !== false && !data.id_client) {
      ctx.addIssue({
        code: "custom",
        message: "El cliente es obligatorio",
        path: ["id_client"],
      });
    }

    if (data.active !== false && data.price === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "El precio es obligatorio",
        path: ["price"],
      });
    }
  })
  .transform((data) => ({
    ...data,
    price: data.price ?? 0,
  }));

export const reservationCreateFormSchema = reservationBaseSchema
  .omit({ id_resource: true })
  .superRefine((data, ctx) => {
    if (data.start_date && data.end_date && data.start_date > data.end_date) {
      ctx.addIssue({
        code: "custom",
        message: "La fecha hasta no puede ser menor que la fecha desde",
        path: ["end_date"],
      });
    }

    if (data.active !== false && !data.id_client) {
      ctx.addIssue({
        code: "custom",
        message: "El cliente es obligatorio",
        path: ["id_client"],
      });
    }

    if (data.active !== false && data.price === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "El precio es obligatorio",
        path: ["price"],
      });
    }
  });

export const reservationUpdateSchema = reservationBaseSchema
  .partial()
  .superRefine((data, ctx) => {
    if (data.start_date && data.end_date && data.start_date > data.end_date) {
      ctx.addIssue({
        code: "custom",
        message: "La fecha hasta no puede ser menor que la fecha desde",
        path: ["end_date"],
      });
    }

    if (data.active !== false) {
      if (data.id_client === null) {
        ctx.addIssue({
          code: "custom",
          message: "El cliente es obligatorio",
          path: ["id_client"],
        });
      }
    }
  });

export const reservationCreateSchemaWithClientRule = reservationCreateSchema;

export type ReservationCreateSchema = z.output<typeof reservationCreateSchema>;
export type ReservationUpdateSchema = z.output<typeof reservationUpdateSchema>;

export type ReservationCreateFormSchema = z.output<
  typeof reservationCreateFormSchema
>;
