import type { Reservation } from "../../domain/reservation/Reservation";
import type {
  ReservationCreateInput,
  ReservationUpdateInput,
} from "../../../shared/types/reservation";
import type { ReservationRepository } from "../../domain/reservation/ReservationRepository";
import { prisma } from "../../utils/db";

function toDomainReservation(dbReservation: any): Reservation {
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

function isoToLocalDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

export class PrismaReservationRepository implements ReservationRepository {
  async create(data: ReservationCreateInput): Promise<Reservation> {
    const created = await prisma.reservation.create({
      data: {
        start_date: isoToLocalDate(data.start_date),
        end_date: isoToLocalDate(data.end_date),
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
          ? isoToLocalDate(data.start_date)
          : undefined,
        end_date: data.end_date ? isoToLocalDate(data.end_date) : undefined,
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
