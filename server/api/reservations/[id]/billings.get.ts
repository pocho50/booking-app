import type { BillingDto } from "../../../../shared/types/billing";
import { PrismaBillingRepository } from "../../../infrastructure/prisma/PrismaBillingRepository";
import { listBillingsByReservation } from "../../../application/billing/listBillingsByReservation";
import { billingToDto } from "../../../utils/billingDto";

export default defineEventHandler(async (event) => {
  const reservationId = getRouterParam(event, "id");
  if (!reservationId) {
    throw createError({
      statusCode: 400,
      statusMessage: "id is required",
    });
  }

  const repo = new PrismaBillingRepository();
  const items = await listBillingsByReservation(repo, reservationId);

  const dto: BillingDto[] = items.map(billingToDto);
  return dto;
});
