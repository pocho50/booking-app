import type { PaymentRepository } from "../../domain/payment/PaymentRepository";

export async function listPaymentsByReservation(
  paymentRepository: PaymentRepository,
  reservationId: string,
) {
  return paymentRepository.listByReservationId(reservationId);
}
