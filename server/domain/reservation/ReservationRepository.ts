import type { Reservation } from "./Reservation";
import type {
  ReservationCreateInput,
  ReservationUpdateInput,
} from "../../../shared/types/reservation";

export interface ReservationRepository {
  create(data: ReservationCreateInput): Promise<Reservation>;
  update(id: string, data: ReservationUpdateInput): Promise<Reservation>;
  delete(id: string): Promise<void>;
}
