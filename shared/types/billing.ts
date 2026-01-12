export type BillingDto = {
  id: string;
  date: string;
  id_reservation: string;
  amount: number;
  observations?: string | null;
};

export type BillingCreateInput = Omit<BillingDto, "id">;

export type BillingCreateForReservationInput = Omit<
  BillingCreateInput,
  "id_reservation"
>;

export type BillingUpdateInput = Partial<BillingCreateInput>;
