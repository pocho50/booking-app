import type { BillingRepository } from "../../domain/billing/BillingRepository";
import type { BillingCreateInput } from "../../../shared/types/billing";

export async function createBilling(
  billingRepository: BillingRepository,
  data: BillingCreateInput
) {
  return billingRepository.create(data);
}
