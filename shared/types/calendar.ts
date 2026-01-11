export type CalendarReservationDto = {
  id?: string;
  startDate: string;
  endDate: string;
  confirmed: number;
  active: number;
  price: number;
  clientFirstName?: string;
  clientLastName?: string;
};

export type CalendarResourceDto = {
  id: string;
  name: string;
  reservations: CalendarReservationDto[];
};
