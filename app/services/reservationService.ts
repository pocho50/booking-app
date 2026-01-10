import type {
  ReservationCreateInput,
  ReservationDto,
} from "../../shared/types/reservation";

export async function createReservation(data: ReservationCreateInput) {
  return $fetch<ReservationDto>("/api/reservations", {
    method: "POST",
    body: data,
  });
}
