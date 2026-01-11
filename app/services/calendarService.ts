import type { CalendarResourceDto } from "../../shared/types/calendar";

export async function listCalendarResources(params: {
  month: number;
  year: number;
}) {
  return $fetch<CalendarResourceDto[]>("/api/calendar/resources", {
    query: params,
  });
}
