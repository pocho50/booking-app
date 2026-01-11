import type { ReservationRepository } from "../../domain/reservation/ReservationRepository";

export async function getReservationById(
  reservationRepository: ReservationRepository,
  id: string
) {
  return reservationRepository.getById(id);
}
