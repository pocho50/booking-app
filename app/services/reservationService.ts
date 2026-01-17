import type {
  ReservationCreateInput,
  ReservationDto,
  ReservationListItemDto,
  ReservationUpdateInput,
} from "../../shared/types/reservation";

export async function listReservations(): Promise<ReservationListItemDto[]> {
  const { $api } = useNuxtApp();

  return $api<ReservationListItemDto[]>("/reservations");
}

export async function createReservation(data: ReservationCreateInput) {
  const { $api } = useNuxtApp();

  return $api<ReservationDto>("/reservations", {
    method: "POST",
    body: data,
  });
}

export async function getReservation(id: string) {
  const { $api } = useNuxtApp();

  return $api<ReservationDto>(`/reservations/${id}`);
}

export async function updateReservation(
  id: string,
  data: ReservationUpdateInput
) {
  const { $api } = useNuxtApp();

  return $api<ReservationDto>(`/reservations/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteReservation(id: string) {
  const { $api } = useNuxtApp();

  return $api<void>(`/reservations/${id}`, {
    method: "DELETE",
  });
}
