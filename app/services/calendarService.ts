export type CalendarReservationDto = {
  id?: string;
  startDate?: string;
  endDate?: string;
  confirmed?: number;
  active?: number;
  clientFirstName?: string;
  clientLastName?: string;
};

export type CalendarResourceDto = {
  id: string;
  name: string;
  reservations: CalendarReservationDto[];
};

export async function listCalendarResources(params: {
  month: number;
  year: number;
}) {
  return $fetch<CalendarResourceDto[]>("/api/calendar/resources", {
    query: params,
  });
}
