import type { ReservationRepository } from "../../domain/reservation/ReservationRepository";
import type { ReservationCreateInput } from "../../../shared/types/reservation";

export class ReservationOverlapError extends Error {
  constructor() {
    super("El recurso ya está ocupado en esas fechas");
    this.name = "ReservationOverlapError";
  }
}

export async function createReservation(
  reservationRepository: ReservationRepository,
  data: ReservationCreateInput
) {
  const overlap = await reservationRepository.hasOverlap({
    resourceId: data.id_resource,
    startDate: data.start_date,
    endDate: data.end_date,
  });

  if (overlap) {
    throw new ReservationOverlapError();
  }

  return reservationRepository.create(data);
}
