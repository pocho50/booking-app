import type {
  PaymentCreateForReservationInput,
  PaymentDto,
} from "../../shared/types/payment";

export async function listPaymentsByReservation(reservationId: string) {
  const { $api } = useNuxtApp();

  return $api<PaymentDto[]>(`/reservations/${reservationId}/payments`);
}

export async function createPaymentForReservation(
  reservationId: string,
  data: PaymentCreateForReservationInput,
) {
  const { $api } = useNuxtApp();

  return $api<PaymentDto>(`/reservations/${reservationId}/payments`, {
    method: "POST",
    body: data,
  });
}

export async function deletePayment(paymentId: string) {
  const { $api } = useNuxtApp();

  return $api<void>(`/payments/${paymentId}`, {
    method: "DELETE",
  });
}
