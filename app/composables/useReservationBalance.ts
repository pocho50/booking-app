import { computed, ref } from "vue";
import type { ComputedRef, Ref } from "vue";

type BillingsTotalChangePayload = {
  total: number;
  pending: boolean;
};

export function useReservationBalance(
  reservationPrice: Ref<number> | ComputedRef<number>
) {
  const billingsTotal = ref(0);
  const billingsPending = ref(false);

  const saldo = computed(() => reservationPrice.value - billingsTotal.value);

  function onBillingsTotalChange(payload: BillingsTotalChangePayload) {
    billingsTotal.value = payload.total;
    billingsPending.value = payload.pending;
  }

  return {
    billingsTotal,
    billingsPending,
    saldo,
    onBillingsTotalChange,
  };
}
