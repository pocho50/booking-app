import type { PaymentRepository } from "../../domain/payment/PaymentRepository";
import type { PaymentCreateInput } from "../../../shared/types/payment";

export async function createPayment(
  paymentRepository: PaymentRepository,
  data: PaymentCreateInput,
) {
  return paymentRepository.create(data);
}
