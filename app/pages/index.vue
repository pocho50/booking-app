<script setup lang="ts">
import { listCalendarResources } from "../services/calendarService";
import type { CalendarResourceDto } from "../../shared/types/calendar";
import { formatMoney } from "../../shared/utils/moneyFormat";

const today = new Date();
const month = ref(today.getMonth() + 1);
const year = ref(today.getFullYear());
const loading = ref(false);

const {
  data: resourcesData,
  pending: resourcesPending,
  error: resourcesError,
  refresh: refreshResources,
} = useAsyncData<CalendarResourceDto[]>(
  "calendar-resources",
  () => listCalendarResources({ month: month.value, year: year.value }),
  { watch: [month, year] }
);

const resources = computed<CalendarResourceDto[]>(
  () => resourcesData.value ?? []
);

const {
  reservationDrawerOpen,
  selectedReservationResource,
  selectedReservationIsoDate,
  editingReservationId,
  reservationInitialValues,
  reservationLoading,
  billingsDrawerOpen,
  billingsReservationId,
  billingsReservation,
  deleteModalOpen,
  deleting,
  reservationDateLabel,
  drawerTitle,
  billingsDrawerTitle,
  onAvailableDayClick,
  onReservationEdit,
  onReservationBillings,
  onReservationSubmit,
  onReservationCancel,
  onBillingsDrawerClose,
  openBillingsById,
  syncEditingReservationSaldoFromCalendar,
  confirmDeleteReservation,
} = useCalendarReservationDrawer({
  resources,
  refreshResources,
});

async function onMonthChange() {
  loading.value = true;
  try {
    await refreshResources();
  } finally {
    loading.value = false;
  }
}

async function onBillingsUpdated() {
  await refreshResources();
  syncEditingReservationSaldoFromCalendar(resources.value);
}
</script>

<template>
  <section class="py-4">
    <AppCalendarV2
      v-model:month="month"
      v-model:year="year"
      :resources="resources"
      :loading="loading || resourcesPending"
      @month-change="onMonthChange"
      @available-day-click="onAvailableDayClick"
      @reservation-edit="onReservationEdit"
      @reservation-billings="onReservationBillings"
    />

    <AppErrorMessage
      v-if="resourcesError"
      :error="resourcesError"
      show-retry
      @retry="refreshResources()"
    />

    <UDrawer
      v-model:open="reservationDrawerOpen"
      :title="drawerTitle"
      direction="right"
      :dismissible="true"
      :ui="{ content: 'w-[420px] sm:w-[520px] max-w-[90vw]' }"
    >
      <template #body>
        <div
          v-if="reservationInitialValues && editingReservationId"
          class="mb-4 rounded-lg border border-default bg-elevated/40 p-3"
        >
          <div class="flex items-center justify-between gap-3">
            <div>
              <div class="text-xs uppercase tracking-wide text-muted">
                Saldo
              </div>
              <div class="text-base font-semibold text-highlighted">
                {{
                  formatMoney(
                    reservationInitialValues.saldo ??
                      reservationInitialValues.price ??
                      0
                  )
                }}
              </div>
            </div>
            <UButton
              size="xs"
              color="neutral"
              variant="outline"
              @click="openBillingsById(editingReservationId)"
            >
              Ver cobros
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
          @submit="onReservationSubmit"
          @cancel="onReservationCancel"
        />
      </template>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <UButton
            v-if="editingReservationId"
            color="error"
            variant="outline"
            :disabled="reservationLoading"
            @click="deleteModalOpen = true"
          >
            Eliminar
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            @click="onReservationCancel"
          >
            Cancelar
          </UButton>
          <UButton type="submit" form="reservation-form"> Guardar </UButton>
        </div>
      </template>
    </UDrawer>

    <UDrawer
      v-model:open="billingsDrawerOpen"
      :title="billingsDrawerTitle"
      direction="right"
      :dismissible="true"
      :ui="{ content: 'w-[520px] sm:w-[680px] max-w-[90vw]' }"
      @close="onBillingsDrawerClose"
    >
      <template #body>
        <div v-if="billingsReservationId" class="space-y-4">
          <ReservationDetailBillingsTab
            :reservation-id="billingsReservationId"
            @billings-updated="onBillingsUpdated"
          />
        </div>
        <div v-else class="text-sm text-muted">No hay reserva.</div>
      </template>

      <template #footer>
        <div class="flex items-center justify-end">
          <UButton
            color="neutral"
            variant="outline"
            @click="onBillingsDrawerClose"
          >
            Cerrar
          </UButton>
        </div>
      </template>
    </UDrawer>

    <AppConfirmModal
      v-model="deleteModalOpen"
      title="Eliminar reserva"
      description="¿Eliminar esta reserva? Esta acción no se puede deshacer."
      confirm-label="Eliminar"
      confirm-color="error"
      :loading="deleting"
      @confirm="confirmDeleteReservation"
    />
  </section>
</template>
