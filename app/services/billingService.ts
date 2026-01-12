import type {
  BillingDto,
  BillingCreateForReservationInput,
} from "../../shared/types/billing";

export async function listBillingsByReservation(reservationId: string) {
  return $fetch<BillingDto[]>(`/api/reservations/${reservationId}/billings`);
}

export async function createBillingForReservation(
  reservationId: string,
  data: BillingCreateForReservationInput
) {
  return $fetch<BillingDto>(`/api/reservations/${reservationId}/billings`, {
    method: "POST",
    body: data,
  });
}

export async function deleteBilling(billingId: string) {
  return $fetch<void>(`/api/billings/${billingId}`, {
    method: "DELETE",
  });
}
