import type { CalendarResourceDto } from "../../../shared/types/calendar";

export interface CalendarRepository {
  listResourcesWithReservations(params: {
    month: number;
    year: number;
  }): Promise<CalendarResourceDto[]>;
}
