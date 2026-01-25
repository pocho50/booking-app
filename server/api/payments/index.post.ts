import { paymentCreateSchema } from "../../../shared/schemas/payment";
import type { PaymentCreateInput } from "../../../shared/types/payment";
import { createPayment } from "../../application/payment/createPayment";
import { PrismaPaymentRepository } from "../../infrastructure/prisma/PrismaPaymentRepository";
import { paymentToDto } from "../../utils/paymentDto";

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) =>
    paymentCreateSchema.safeParse(body),
  );

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0]?.message || "Invalid body",
    });
  }

  const data: PaymentCreateInput = result.data;

  const repo = new PrismaPaymentRepository();
  const created = await createPayment(repo, data);

  setResponseStatus(event, 201);
  return paymentToDto(created);
});
