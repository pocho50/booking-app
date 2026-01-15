import { getReservationById } from "../../application/reservation/getReservationById";
import { listBillingsByReservation } from "../../application/billing/listBillingsByReservation";
import { PrismaBillingRepository } from "../../infrastructure/prisma/PrismaBillingRepository";
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

  const billingRepo = new PrismaBillingRepository();
  const billings = await listBillingsByReservation(billingRepo, id);
  return {
    ...reservationToDto(reservation),
    saldo: calculateReservationSaldo(reservation.price, billings),
  };
});
