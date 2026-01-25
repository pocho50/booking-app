export type PaymentDto = {
  id: string;
  date: string;
  id_reservation: string;
  amount: number;
  observations?: string | null;
};

export type PaymentCreateInput = Omit<PaymentDto, "id">;

export type PaymentCreateForReservationInput = Omit<
  PaymentCreateInput,
  "id_reservation"
>;

export type PaymentUpdateInput = Partial<PaymentCreateInput>;
