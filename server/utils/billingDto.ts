import type { Billing } from "../domain/billing/Billing";
import type { BillingDto } from "../../shared/types/billing";
import { dateToIsoLocal } from "./date";

export function billingToDto(b: Billing): BillingDto {
  return {
    id: b.id,
    date: dateToIsoLocal(b.date),
    id_reservation: b.id_reservation,
    amount: b.amount,
    observations: b.observations ?? null,
  };
}
