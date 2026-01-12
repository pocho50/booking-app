export type Billing = {
  id: string;
  date: Date;
  id_reservation: string;
  amount: number;
  observations?: string | null;
};
