import { deleteBilling } from "../../application/billing/deleteBilling";
import { PrismaBillingRepository } from "../../infrastructure/prisma/PrismaBillingRepository";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "id is required" });
  }

  const repo = new PrismaBillingRepository();
  await deleteBilling(repo, id);

  setResponseStatus(event, 204);
  return null;
});
