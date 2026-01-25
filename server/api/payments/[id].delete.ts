import { deletePayment } from "../../application/payment/deletePayment";
import { PrismaPaymentRepository } from "../../infrastructure/prisma/PrismaPaymentRepository";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "id is required" });
  }

  const repo = new PrismaPaymentRepository();
  await deletePayment(repo, id);

  setResponseStatus(event, 204);
  return null;
});
