export type Reservation = {
  id: string;
  start_date: Date;
  end_date: Date;
  id_resource: string;
  id_client: string | null;
  observation?: string | null;
  price: number;
  confirmed: boolean;
  active: boolean;
};
