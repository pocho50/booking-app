import { paymentUpdateSchema } from "../../../shared/schemas/payment";
import type { PaymentUpdateInput } from "../../../shared/types/payment";
import { updatePayment } from "../../application/payment/updatePayment";
import { PrismaPaymentRepository } from "../../infrastructure/prisma/PrismaPaymentRepository";
import { paymentToDto } from "../../utils/paymentDto";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "id is required" });
  }

  const result = await readValidatedBody(event, (body) =>
    paymentUpdateSchema.safeParse(body),
  );

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0]?.message || "Invalid body",
    });
  }

  const data: PaymentUpdateInput = {
    ...result.data,
    observations:
      result.data.observations === undefined
        ? undefined
        : (result.data.observations ?? null),
  };

  const repo = new PrismaPaymentRepository();
  const updated = await updatePayment(repo, id, data);
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: "Payment not found" });
  }

  return paymentToDto(updated);
});
