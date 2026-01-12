import type { BillingRepository } from "../../domain/billing/BillingRepository";
import type { BillingUpdateInput } from "../../../shared/types/billing";

export async function updateBilling(
  billingRepository: BillingRepository,
  id: string,
  data: BillingUpdateInput
) {
  const existing = await billingRepository.getById(id);
  if (!existing) {
    return null;
  }

  return billingRepository.update(id, data);
}
