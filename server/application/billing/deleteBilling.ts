import type { BillingRepository } from "../../domain/billing/BillingRepository";

export async function deleteBilling(
  billingRepository: BillingRepository,
  id: string
) {
  return billingRepository.delete(id);
}
