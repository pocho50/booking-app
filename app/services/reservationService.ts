import type {
  ReservationCreateInput,
  ReservationDto,
  ReservationUpdateInput,
} from "../../shared/types/reservation";

export async function createReservation(data: ReservationCreateInput) {
  return $fetch<ReservationDto>("/api/reservations", {
    method: "POST",
    body: data,
  });
}

export async function getReservation(id: string) {
  return $fetch<ReservationDto>(`/api/reservations/${id}`);
}

export async function updateReservation(
  id: string,
  data: ReservationUpdateInput
) {
  return $fetch<ReservationDto>(`/api/reservations/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteReservation(id: string) {
  return $fetch<void>(`/api/reservations/${id}`, {
    method: "DELETE",
  });
}
