type PaymentAmount = {
  amount: number;
};

export function calculateReservationSaldo(
  price: number,
  payments: PaymentAmount[],
) {
  const paymentsTotal = payments.reduce(
    (acc, payment) => acc + payment.amount,
    0,
  );

  return price - paymentsTotal;
}
