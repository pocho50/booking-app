import type { PaymentRepository } from "../../domain/payment/PaymentRepository";

export async function deletePayment(
  paymentRepository: PaymentRepository,
  id: string,
) {
  return paymentRepository.delete(id);
}
