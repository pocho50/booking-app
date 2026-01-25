import type { Payment } from "./Payment";
import type {
  PaymentCreateInput,
  PaymentUpdateInput,
} from "../../../shared/types/payment";

export interface PaymentRepository {
  getById(id: string): Promise<Payment | null>;
  listByReservationId(reservationId: string): Promise<Payment[]>;
  create(data: PaymentCreateInput): Promise<Payment>;
  update(id: string, data: PaymentUpdateInput): Promise<Payment>;
  delete(id: string): Promise<void>;
}
