import type { Payment } from "../../domain/payment/Payment";
import type { Payment as PrismaPayment } from "#prisma-client";
import type {
  PaymentCreateInput,
  PaymentUpdateInput,
} from "../../../shared/types/payment";
import type { PaymentRepository } from "../../domain/payment/PaymentRepository";
import { prisma } from "../../utils/db";
import { isoDateToLocalDate } from "../../utils/date";

function toDomainPayment(dbPayment: PrismaPayment): Payment {
  return {
    id: dbPayment.id,
    date: dbPayment.date,
    id_reservation: dbPayment.id_reservation,
    amount: dbPayment.amount,
    observations: dbPayment.observations,
  };
}

export class PrismaPaymentRepository implements PaymentRepository {
  async getById(id: string): Promise<Payment | null> {
    const found = await prisma.payment.findUnique({ where: { id } });
    if (!found) {
      return null;
    }
    return toDomainPayment(found);
  }

  async listByReservationId(reservationId: string): Promise<Payment[]> {
    const items = await prisma.payment.findMany({
      where: { id_reservation: reservationId },
      orderBy: { date: "desc" },
    });

    return items.map(toDomainPayment);
  }

  async create(data: PaymentCreateInput): Promise<Payment> {
    const created = await prisma.payment.create({
      data: {
        date: isoDateToLocalDate(data.date),
        id_reservation: data.id_reservation,
        amount: data.amount,
        observations: data.observations ?? null,
      },
    });

    return toDomainPayment(created);
  }

  async update(id: string, data: PaymentUpdateInput): Promise<Payment> {
    const updated = await prisma.payment.update({
      where: { id },
      data: {
        date: data.date ? isoDateToLocalDate(data.date) : undefined,
        id_reservation: data.id_reservation,
        amount: data.amount,
        observations: data.observations ?? undefined,
      },
    });

    return toDomainPayment(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.payment.delete({ where: { id } });
  }
}
