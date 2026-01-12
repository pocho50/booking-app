import type { Billing } from "../../domain/billing/Billing";
import type { Billing as PrismaBilling } from "#prisma-client";
import type {
  BillingCreateInput,
  BillingUpdateInput,
} from "../../../shared/types/billing";
import type { BillingRepository } from "../../domain/billing/BillingRepository";
import { prisma } from "../../utils/db";
import { isoDateToLocalDate } from "../../utils/date";

function toDomainBilling(dbBilling: PrismaBilling): Billing {
  return {
    id: dbBilling.id,
    date: dbBilling.date,
    id_reservation: dbBilling.id_reservation,
    amount: dbBilling.amount,
    observations: dbBilling.observations,
  };
}

export class PrismaBillingRepository implements BillingRepository {
  async getById(id: string): Promise<Billing | null> {
    const found = await prisma.billing.findUnique({ where: { id } });
    if (!found) {
      return null;
    }
    return toDomainBilling(found);
  }

  async create(data: BillingCreateInput): Promise<Billing> {
    const created = await prisma.billing.create({
      data: {
        date: isoDateToLocalDate(data.date),
        id_reservation: data.id_reservation,
        amount: data.amount,
        observations: data.observations ?? null,
      },
    });

    return toDomainBilling(created);
  }

  async update(id: string, data: BillingUpdateInput): Promise<Billing> {
    const updated = await prisma.billing.update({
      where: { id },
      data: {
        date: data.date ? isoDateToLocalDate(data.date) : undefined,
        id_reservation: data.id_reservation,
        amount: data.amount,
        observations: data.observations ?? undefined,
      },
    });

    return toDomainBilling(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.billing.delete({ where: { id } });
  }
}
