import type { ReservationRepository } from "../../domain/reservation/ReservationRepository";
import type { ReservationUpdateInput } from "../../../shared/types/reservation";
import { ReservationOverlapError } from "./createReservation";
import { dateToIsoLocal } from "../../utils/date";

export async function updateReservation(
  reservationRepository: ReservationRepository,
  id: string,
  data: ReservationUpdateInput
) {
  const existing = await reservationRepository.getById(id);
  if (!existing) {
    return null;
  }

  const nextResourceId = data.id_resource ?? existing.id_resource;
  const nextStartDate = data.start_date ?? dateToIsoLocal(existing.start_date);
  const nextEndDate = data.end_date ?? dateToIsoLocal(existing.end_date);

  const overlap = await reservationRepository.hasOverlap({
    resourceId: nextResourceId,
    startDate: nextStartDate,
    endDate: nextEndDate,
    excludeReservationId: id,
  });

  if (overlap) {
    throw new ReservationOverlapError();
  }

  return reservationRepository.update(id, data);
}
