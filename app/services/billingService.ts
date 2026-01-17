import type {
  BillingDto,
  BillingCreateForReservationInput,
} from "../../shared/types/billing";

export async function listBillingsByReservation(reservationId: string) {
  const { $api } = useNuxtApp();

  return $api<BillingDto[]>(`/reservations/${reservationId}/billings`);
}

export async function createBillingForReservation(
  reservationId: string,
  data: BillingCreateForReservationInput
) {
  const { $api } = useNuxtApp();

  return $api<BillingDto>(`/reservations/${reservationId}/billings`, {
    method: "POST",
    body: data,
  });
}

export async function deleteBilling(billingId: string) {
  const { $api } = useNuxtApp();

  return $api<void>(`/billings/${billingId}`, {
    method: "DELETE",
  });
}
