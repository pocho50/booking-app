import type { CalendarRepository } from "../../domain/calendar/CalendarRepository";
import type { CalendarResourceDto } from "../../../shared/types/calendar";

export async function listCalendarResources(
  calendarRepository: CalendarRepository,
  params: {
    month: number;
    year: number;
  }
): Promise<CalendarResourceDto[]> {
  return calendarRepository.listResourcesWithReservations(params);
}
