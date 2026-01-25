import type { PaymentRepository } from "../../domain/payment/PaymentRepository";
import type { PaymentUpdateInput } from "../../../shared/types/payment";

export async function updatePayment(
  paymentRepository: PaymentRepository,
  id: string,
  data: PaymentUpdateInput,
) {
  const existing = await paymentRepository.getById(id);
  if (!existing) {
    return null;
  }

  return paymentRepository.update(id, data);
}
