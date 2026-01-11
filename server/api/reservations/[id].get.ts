import { getReservationById } from "../../application/reservation/getReservationById";
import { PrismaReservationRepository } from "../../infrastructure/prisma/PrismaReservationRepository";
import { reservationToDto } from "../../utils/reservationDto";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "id is required" });
  }

  const repo = new PrismaReservationRepository();
  const reservation = await getReservationById(repo, id);

  if (!reservation) {
    throw createError({
      statusCode: 404,
      statusMessage: "Reservation not found",
    });
  }

  return reservationToDto(reservation);
});
