export type ReservationDto = {
  id: string;
  start_date: string;
  end_date: string;
  id_resource: string;
  id_client: string | null;
  observation?: string | null;
  price: number;
  saldo?: number;
  confirmed: boolean;
  active: boolean;
};

export type ReservationListItemDto = {
  id: string;
  client: string;
  resource: string;
  start_date: string;
  end_date: string;
  price: number;
  saldo: number;
  confirmed: boolean;
};

export type ReservationCreateInput = Omit<ReservationDto, "id">;

export type ReservationUpdateInput = Partial<ReservationCreateInput>;
