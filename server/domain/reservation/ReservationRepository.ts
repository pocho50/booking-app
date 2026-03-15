import type { Reservation } from "./Reservation";
import type {
  ReservationCreateInput,
  ReservationListItemDto,
  ReservationUpdateInput,
} from "../../../shared/types/reservation";

export interface ReservationRepository {
  listActiveWithDetails(): Promise<ReservationListItemDto[]>;
  hasOverlap(params: {
    resourceId: string;
    startDate: string;
    endDate: string;
    excludeReservationId?: string;
  }): Promise<boolean>;
  getById(id: string): Promise<Reservation | null>;
  create(data: ReservationCreateInput): Promise<Reservation>;
  update(id: string, data: ReservationUpdateInput): Promise<Reservation>;
  delete(id: string): Promise<void>;
}
