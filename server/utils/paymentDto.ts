import type { Payment } from "../domain/payment/Payment";
import type { PaymentDto } from "../../shared/types/payment";
import { dateToIsoLocal } from "./date";

export function paymentToDto(payment: Payment): PaymentDto {
  return {
    id: payment.id,
    date: dateToIsoLocal(payment.date),
    id_reservation: payment.id_reservation,
    amount: payment.amount,
    observations: payment.observations ?? null,
  };
}
