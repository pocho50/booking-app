import type { BillingRepository } from "../../domain/billing/BillingRepository";

export async function getBillingById(
  billingRepository: BillingRepository,
  id: string
) {
  return billingRepository.getById(id);
}
