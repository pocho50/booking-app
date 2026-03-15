import {
  createPaymentForReservation,
  deletePayment,
  listPaymentsByReservation,
} from "../services/paymentService";

export function useReservationPayments(reservationId: Ref<string>) {
  const creating = ref(false);
  const deleting = ref(false);

  const {
    data: paymentsData,
    status,
    pending,
    refresh,
    error,
  } = useAsyncData<PaymentDto[]>(
    () => `reservation-${reservationId.value}-payments`,
    () => listPaymentsByReservation(reservationId.value),
  );

  const payments = computed(() => paymentsData.value ?? []);

  async function create(data: PaymentCreateForReservationInput) {
    try {
      creating.value = true;
      const created = await createPaymentForReservation(
        reservationId.value,
        data,
      );
      await refresh();
      return created;
    } finally {
      creating.value = false;
    }
  }

  async function remove(paymentId: string) {
    try {
      deleting.value = true;
      await deletePayment(paymentId);
      await refresh();
    } finally {
      deleting.value = false;
    }
  }

  return {
    payments,
    status,
    pending,
    error,
    refresh,
    creating,
    deleting,
    create,
    remove,
  };
}
