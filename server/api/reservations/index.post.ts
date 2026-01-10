import { createError, readValidatedBody, setResponseStatus } from "h3";
import { createReservation } from "../../application/reservation/createReservation";
import type { ReservationCreateInput } from "../../../shared/types/reservation";
import { reservationCreateSchemaWithClientRule } from "../../../shared/schemas/reservation";
import { PrismaReservationRepository } from "../../infrastructure/prisma/PrismaReservationRepository";

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) =>
    reservationCreateSchemaWithClientRule.safeParse(body)
  );
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0]?.message || "Invalid body",
    });
  }

  const data: ReservationCreateInput = result.data;

  const repo = new PrismaReservationRepository();
  const created = await createReservation(repo, data);

  setResponseStatus(event, 201);
  return {
    id: created.id,
    ...data,
    observation: data.observation ?? null,
  };
});
