import type { PaymentRepository } from "../../domain/payment/PaymentRepository";

export async function getPaymentById(
  paymentRepository: PaymentRepository,
  id: string,
) {
  return paymentRepository.getById(id);
}
