type BillingAmount = {
  amount: number;
};

export function calculateReservationSaldo(
  price: number,
  billings: BillingAmount[]
) {
  const billingsTotal = billings.reduce(
    (acc, billing) => acc + billing.amount,
    0
  );

  return price - billingsTotal;
}
