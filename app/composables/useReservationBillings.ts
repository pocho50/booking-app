import type { Ref } from "vue";
import type {
  BillingCreateForReservationInput,
  BillingDto,
} from "../../shared/types/billing";
import {
  createBillingForReservation,
  deleteBilling,
  listBillingsByReservation,
} from "../services/billingService";

export function useReservationBillings(reservationId: Ref<string>) {
  const creating = ref(false);
  const deleting = ref(false);

  const {
    data: billingsData,
    status,
    pending,
    refresh,
    error,
  } = useAsyncData<BillingDto[]>(
    () => `reservation-${reservationId.value}-billings`,
    () => listBillingsByReservation(reservationId.value)
  );

  const billings = computed(() => billingsData.value ?? []);

  async function create(data: BillingCreateForReservationInput) {
    try {
      creating.value = true;
      const created = await createBillingForReservation(
        reservationId.value,
        data
      );
      await refresh();
      return created;
    } finally {
      creating.value = false;
    }
  }

  async function remove(billingId: string) {
    try {
      deleting.value = true;
      await deleteBilling(billingId);
      await refresh();
    } finally {
      deleting.value = false;
    }
  }

  return {
    billings,
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
