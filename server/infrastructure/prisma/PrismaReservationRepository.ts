import type { Reservation } from "../../domain/reservation/Reservation";
import type { Reservation as PrismaReservation } from "#prisma-client";
import type {
  ReservationCreateInput,
  ReservationListItemDto,
  ReservationUpdateInput,
} from "../../../shared/types/reservation";
import type { ReservationRepository } from "../../domain/reservation/ReservationRepository";
import { prisma } from "../../utils/db";
import { dateToIsoLocal, isoDateToLocalDate } from "../../utils/date";
import { calculateReservationSaldo } from "../../utils/reservationSaldo";

function toDomainReservation(dbReservation: PrismaReservation): Reservation {
  return {
    id: dbReservation.id,
    start_date: dbReservation.start_date,
    end_date: dbReservation.end_date,
    id_resource: dbReservation.id_resource,
    id_client: dbReservation.id_client,
    observation: dbReservation.observation,
    price: dbReservation.price,
    confirmed: dbReservation.confirmed,
    active: dbReservation.active,
  };
}

export class PrismaReservationRepository implements ReservationRepository {
  async listActiveWithDetails(): Promise<ReservationListItemDto[]> {
    const reservations = await prisma.reservation.findMany({
      where: { active: true },
      orderBy: { start_date: "desc" },
      include: {
        client: { select: { name: true, last_name: true } },
        resource: { select: { name: true } },
        payments: { select: { amount: true } },
      },
    });

    return reservations.map((r) => {
      return {
        id: r.id,
        client: r.client
          ? `${r.client.name} ${r.client.last_name}`.trim()
          : "-",
        resource: r.resource?.name ?? "-",
        start_date: dateToIsoLocal(r.start_date),
        end_date: dateToIsoLocal(r.end_date),
        price: r.price,
        saldo: calculateReservationSaldo(r.price, r.payments),
        confirmed: r.confirmed,
      };
    });
  }

  async hasOverlap(params: {
    resourceId: string;
    startDate: string;
    endDate: string;
    excludeReservationId?: string;
  }): Promise<boolean> {
    const startDate = isoDateToLocalDate(params.startDate);
    const endDate = isoDateToLocalDate(params.endDate);

    const overlap = await prisma.reservation.findFirst({
      where: {
        id_resource: params.resourceId,
        id: params.excludeReservationId
          ? { not: params.excludeReservationId }
          : undefined,
        start_date: { lte: endDate },
        end_date: { gte: startDate },
      },
      select: { id: true },
    });

    return Boolean(overlap);
  }

  async getById(id: string): Promise<Reservation | null> {
    const found = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!found) {
      return null;
    }

    return toDomainReservation(found);
  }

  async create(data: ReservationCreateInput): Promise<Reservation> {
    const created = await prisma.reservation.create({
      data: {
        start_date: isoDateToLocalDate(data.start_date),
        end_date: isoDateToLocalDate(data.end_date),
        id_resource: data.id_resource,
        id_client: data.active === false ? null : data.id_client,
        observation: data.observation ?? null,
        price: data.price,
        confirmed: data.confirmed,
        active: data.active,
      },
    });

    return toDomainReservation(created);
  }

  async update(id: string, data: ReservationUpdateInput): Promise<Reservation> {
    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        start_date: data.start_date
          ? isoDateToLocalDate(data.start_date)
          : undefined,
        end_date: data.end_date ? isoDateToLocalDate(data.end_date) : undefined,
        id_resource: data.id_resource,
        id_client:
          data.active === false
            ? null
            : data.id_client === undefined
              ? undefined
              : data.id_client,
        observation: data.observation ?? undefined,
        price: data.price,
        confirmed: data.confirmed,
        active: data.active,
      },
    });

    return toDomainReservation(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.reservation.delete({ where: { id } });
  }
}
