import { getReservationById } from "../../application/reservation/getReservationById";
import { listPaymentsByReservation } from "../../application/payment/listPaymentsByReservation";
import { PrismaPaymentRepository } from "../../infrastructure/prisma/PrismaPaymentRepository";
import { PrismaReservationRepository } from "../../infrastructure/prisma/PrismaReservationRepository";
import { calculateReservationSaldo } from "../../utils/reservationSaldo";
import { reservationToDto } from "../../utils/reservationDto";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "id is required" });
  }

  const reservationRepo = new PrismaReservationRepository();
  const reservation = await getReservationById(reservationRepo, id);

  if (!reservation) {
    throw createError({
      statusCode: 404,
      statusMessage: "Reservation not found",
    });
  }

  const paymentRepo = new PrismaPaymentRepository();
  const payments = await listPaymentsByReservation(paymentRepo, id);
  return {
    ...reservationToDto(reservation),
    saldo: calculateReservationSaldo(reservation.price, payments),
  };
});
