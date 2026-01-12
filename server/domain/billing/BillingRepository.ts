import type { Billing } from "./Billing";
import type {
  BillingCreateInput,
  BillingUpdateInput,
} from "../../../shared/types/billing";

export interface BillingRepository {
  getById(id: string): Promise<Billing | null>;
  create(data: BillingCreateInput): Promise<Billing>;
  update(id: string, data: BillingUpdateInput): Promise<Billing>;
  delete(id: string): Promise<void>;
}
