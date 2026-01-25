import type { PaymentCreateInput } from "../../../../shared/types/payment";
import { paymentCreateForReservationSchema } from "../../../../shared/schemas/payment";
import { createPayment } from "../../../application/payment/createPayment";
import { PrismaPaymentRepository } from "../../../infrastructure/prisma/PrismaPaymentRepository";
import { paymentToDto } from "../../../utils/paymentDto";

export default defineEventHandler(async (event) => {
  const reservationId = getRouterParam(event, "id");
  if (!reservationId) {
    throw createError({ statusCode: 400, statusMessage: "id is required" });
  }

  const result = await readValidatedBody(event, (body) =>
    paymentCreateForReservationSchema.safeParse(body),
  );

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0]?.message || "Invalid body",
    });
  }

  const data: PaymentCreateInput = {
    ...result.data,
    id_reservation: reservationId,
  };

  const repo = new PrismaPaymentRepository();
  const created = await createPayment(repo, data);

  setResponseStatus(event, 201);
  return paymentToDto(created);
});
