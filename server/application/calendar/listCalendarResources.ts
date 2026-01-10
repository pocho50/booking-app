import type {
  CalendarRepository,
  CalendarResource,
} from "../../domain/calendar/CalendarRepository";

export async function listCalendarResources(
  calendarRepository: CalendarRepository,
  params: {
    month: number;
    year: number;
  }
): Promise<CalendarResource[]> {
  return calendarRepository.listResourcesWithReservations(params);
}
