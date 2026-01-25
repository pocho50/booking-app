export type Payment = {
  id: string;
  date: Date;
  id_reservation: string;
  amount: number;
  observations?: string | null;
};
