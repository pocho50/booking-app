import type { Reservation } from "../domain/reservation/Reservation";
import type { ReservationDto } from "../../shared/types/reservation";
import { dateToIsoLocal } from "./date";

export function reservationToDto(r: Reservation): ReservationDto {
  return {
    id: r.id,
    start_date: dateToIsoLocal(r.start_date),
    end_date: dateToIsoLocal(r.end_date),
    id_resource: r.id_resource,
    id_client: r.id_client,
    observation: r.observation ?? null,
    price: r.price,
    confirmed: r.confirmed,
    active: r.active,
  };
}
