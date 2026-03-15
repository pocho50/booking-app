import type { ReservationRepository } from "../../domain/reservation/ReservationRepository";

export async function listReservations(
  reservationRepository: ReservationRepository,
) {
  return reservationRepository.listActiveWithDetails();
}
