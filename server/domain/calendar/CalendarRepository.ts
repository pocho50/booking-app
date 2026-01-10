export type CalendarReservation = {
  id: string;
  startDate: string;
  endDate: string;
  confirmed: number;
  active: number;
  clientFirstName?: string;
  clientLastName?: string;
};

export type CalendarResource = {
  id: string;
  name: string;
  reservations: CalendarReservation[];
};

export interface CalendarRepository {
  listResourcesWithReservations(params: {
    month: number;
    year: number;
  }): Promise<CalendarResource[]>;
}
