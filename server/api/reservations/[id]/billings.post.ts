import type { BillingCreateInput } from "../../../../shared/types/billing";
import { billingCreateForReservationSchema } from "../../../../shared/schemas/billing";
import { createBilling } from "../../../application/billing/createBilling";
import { PrismaBillingRepository } from "../../../infrastructure/prisma/PrismaBillingRepository";
import { billingToDto } from "../../../utils/billingDto";

export default defineEventHandler(async (event) => {
  const reservationId = getRouterParam(event, "id");
  if (!reservationId) {
    throw createError({ statusCode: 400, statusMessage: "id is required" });
  }

  const result = await readValidatedBody(event, (body) =>
    billingCreateForReservationSchema.safeParse(body)
  );

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0]?.message || "Invalid body",
    });
  }

  const data: BillingCreateInput = {
    ...result.data,
    id_reservation: reservationId,
  };

  const repo = new PrismaBillingRepository();
  const created = await createBilling(repo, data);

  setResponseStatus(event, 201);
  return billingToDto(created);
});
