import type { PaymentDto } from "../../../../shared/types/payment";
import { PrismaPaymentRepository } from "../../../infrastructure/prisma/PrismaPaymentRepository";
import { listPaymentsByReservation } from "../../../application/payment/listPaymentsByReservation";
import { paymentToDto } from "../../../utils/paymentDto";

export default defineEventHandler(async (event) => {
  const reservationId = getRouterParam(event, "id");
  if (!reservationId) {
    throw createError({
      statusCode: 400,
      statusMessage: "id is required",
    });
  }

  const repo = new PrismaPaymentRepository();
  const items = await listPaymentsByReservation(repo, reservationId);

  const dto: PaymentDto[] = items.map(paymentToDto);
  return dto;
});
