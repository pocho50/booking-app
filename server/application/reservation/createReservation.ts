import type { ReservationRepository } from "../../domain/reservation/ReservationRepository";
import type { ReservationCreateInput } from "../../../shared/types/reservation";

export async function createReservation(
  reservationRepository: ReservationRepository,
  data: ReservationCreateInput
) {
  return reservationRepository.create(data);
}
