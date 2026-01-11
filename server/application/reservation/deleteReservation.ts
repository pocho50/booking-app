import type { ReservationRepository } from "../../domain/reservation/ReservationRepository";

export async function deleteReservation(
  reservationRepository: ReservationRepository,
  id: string
) {
  return reservationRepository.delete(id);
}
