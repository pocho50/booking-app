<script setup lang="ts">
import type {
  CalendarReservationDto,
  CalendarResourceDto,
} from "../../../shared/types/calendar";
import type { ReservationDto } from "../../../shared/types/reservation";

const open = defineModel<boolean>("open", { default: false });

type Props = {
  title: string;
  selectedReservationResource: CalendarResourceDto | null;
  selectedReservationIsoDate: string | null;
  reservationDateLabel?: string;
  reservationInitialValues: ReservationDto | null;
  reservationLoading: boolean;
  editingReservationId: string | null;
};

const props = withDefaults(defineProps<Props>(), {
  reservationDateLabel: undefined,
});

const emit = defineEmits<{
  submit: [
    data: {
      clientId: string | null;
      start_date: string;
      end_date: string;
      observation?: string;
      price: number;
      confirmed: boolean;
      active: boolean;
    },
  ];
  cancel: [];
  openPayments: [reservationId: string, reservation: CalendarReservationDto];
  requestDelete: [];
}>();

const shouldShowSaldoCard = computed(() => {
  return Boolean(
    props.reservationInitialValues &&
    props.editingReservationId &&
    props.reservationInitialValues.active,
  );
});

const saldoCardValue = computed(() => {
  const values = props.reservationInitialValues;
  if (!values) return 0;

  return values.saldo ?? values.price ?? 0;
});

function onOpenPaymentsClick() {
  if (!props.editingReservationId || !props.reservationInitialValues) {
    return;
  }

  emit("openPayments", props.editingReservationId, {
    id: props.reservationInitialValues.id,
    startDate: props.reservationInitialValues.start_date,
    endDate: props.reservationInitialValues.end_date,
    confirmed: props.reservationInitialValues.confirmed ? 1 : 0,
    active: props.reservationInitialValues.active ? 1 : 0,
    price: props.reservationInitialValues.price,
    saldo: props.reservationInitialValues.saldo,
  });
}
</script>

<template>
  <UDrawer
    v-model:open="open"
    :title="title"
    description="Formulario para crear o editar la reserva seleccionada."
    direction="right"
    :dismissible="true"
    :ui="{ content: 'w-[420px] sm:w-[520px] max-w-[90vw]' }"
  >
    <template #body>
      <div
        v-if="shouldShowSaldoCard"
        class="mb-4 rounded-lg border border-default bg-elevated/40 p-3"
      >
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="text-xs uppercase tracking-wide text-muted">Saldo</div>
            <div class="text-base font-semibold text-highlighted">
              {{ formatMoney(saldoCardValue) }}
            </div>
          </div>
          <UButton
            size="xs"
            color="neutral"
            variant="outline"
            @click="onOpenPaymentsClick"
          >
            Ver pagos
          </UButton>
        </div>
      </div>

      <ReservationForm
        v-if="selectedReservationResource"
        :resource="selectedReservationResource"
        :date-label="reservationDateLabel"
        :initial-start-date="selectedReservationIsoDate ?? undefined"
        :initial-values="reservationInitialValues ?? undefined"
        :loading="reservationLoading"
        form-id="reservation-form"
        @submit="emit('submit', $event)"
        @cancel="emit('cancel')"
      />
    </template>

    <template #footer>
      <div class="flex items-center justify-end gap-2">
        <UButton
          v-if="editingReservationId"
          color="error"
          variant="outline"
          :disabled="reservationLoading"
          @click="emit('requestDelete')"
        >
          Eliminar
        </UButton>
        <UButton color="neutral" variant="outline" @click="emit('cancel')">
          Cancelar
        </UButton>
        <UButton type="submit" form="reservation-form"> Guardar </UButton>
      </div>
    </template>
  </UDrawer>
</template>
