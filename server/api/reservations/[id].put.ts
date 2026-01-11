import { updateReservation } from "../../application/reservation/updateReservation";
import type {
  ReservationDto,
  ReservationUpdateInput,
} from "../../../shared/types/reservation";
import { reservationUpdateSchema } from "../../../shared/schemas/reservation";
import { PrismaReservationRepository } from "../../infrastructure/prisma/PrismaReservationRepository";
import { ReservationOverlapError } from "../../application/reservation/createReservation";
import { reservationToDto } from "../../utils/reservationDto";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "id is required" });
  }

  const result = await readValidatedBody(event, (body) =>
    reservationUpdateSchema.safeParse(body)
  );
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0]?.message || "Invalid body",
    });
  }

  const data: ReservationUpdateInput = result.data;

  const repo = new PrismaReservationRepository();

  try {
    const updated = await updateReservation(repo, id, data);
    if (!updated) {
      throw createError({
        statusCode: 404,
        statusMessage: "Reservation not found",
      });
    }
    return reservationToDto(updated);
  } catch (err) {
    if (err instanceof ReservationOverlapError) {
      throw createError({ statusCode: 409, statusMessage: err.message });
    }
    throw err;
  }
});
