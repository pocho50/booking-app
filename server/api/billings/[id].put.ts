import { billingUpdateSchema } from "../../../shared/schemas/billing";
import type { BillingUpdateInput } from "../../../shared/types/billing";
import { updateBilling } from "../../application/billing/updateBilling";
import { PrismaBillingRepository } from "../../infrastructure/prisma/PrismaBillingRepository";
import { billingToDto } from "../../utils/billingDto";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "id is required" });
  }

  const result = await readValidatedBody(event, (body) =>
    billingUpdateSchema.safeParse(body)
  );

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0]?.message || "Invalid body",
    });
  }

  const data: BillingUpdateInput = {
    ...result.data,
    observations:
      result.data.observations === undefined
        ? undefined
        : result.data.observations ?? null,
  };

  const repo = new PrismaBillingRepository();
  const updated = await updateBilling(repo, id, data);
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: "Billing not found" });
  }

  return billingToDto(updated);
});
