import type { BillingRepository } from "../../domain/billing/BillingRepository";

export async function listBillingsByReservation(
  billingRepository: BillingRepository,
  reservationId: string
) {
  return billingRepository.listByReservationId(reservationId);
}
