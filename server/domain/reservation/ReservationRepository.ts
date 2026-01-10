import type { Reservation } from "./Reservation";
import type {
  ReservationCreateInput,
  ReservationUpdateInput,
} from "../../../shared/types/reservation";

export interface ReservationRepository {
  hasOverlap(params: {
    resourceId: string;
    startDate: string;
    endDate: string;
  }): Promise<boolean>;
  create(data: ReservationCreateInput): Promise<Reservation>;
  update(id: string, data: ReservationUpdateInput): Promise<Reservation>;
  delete(id: string): Promise<void>;
}
