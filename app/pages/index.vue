<script setup lang="ts">
import { listCalendarResources } from "../services/calendarService";
import type { CalendarResourceDto } from "../../shared/types/calendar";

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
  { watch: [month, year] },
);

const resources = computed<CalendarResourceDto[]>(
  () => resourcesData.value ?? [],
);

const {
  reservationDrawerOpen,
  selectedReservationResource,
  selectedReservationIsoDate,
  editingReservationId,
  reservationInitialValues,
  reservationLoading,
  paymentsDrawerOpen,
  paymentsReservationId,
  paymentsReservation,
  deleteModalOpen,
  deleting,
  reservationDateLabel,
  drawerTitle,
  paymentsDrawerTitle,
  onAvailableDayClick,
  onReservationEdit,
  onReservationPayments,
  onReservationSubmit,
  onReservationCancel,
  onPaymentsDrawerClose,
  openPaymentsById,
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

async function onPaymentsUpdated() {
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
      @reservation-payments="onReservationPayments"
    />

    <AppErrorMessage
      v-if="resourcesError"
      :error="resourcesError"
      show-retry
      @retry="refreshResources()"
    />

    <CalendarReservationDrawer
      v-model:open="reservationDrawerOpen"
      :title="drawerTitle"
      :selected-reservation-resource="selectedReservationResource"
      :selected-reservation-iso-date="selectedReservationIsoDate"
      :reservation-date-label="reservationDateLabel"
      :reservation-initial-values="reservationInitialValues"
      :reservation-loading="reservationLoading"
      :editing-reservation-id="editingReservationId"
      @submit="onReservationSubmit"
      @cancel="onReservationCancel"
      @request-delete="deleteModalOpen = true"
      @open-payments="openPaymentsById"
    />

    <CalendarPaymentsDrawer
      v-model:open="paymentsDrawerOpen"
      :title="paymentsDrawerTitle"
      :reservation-id="paymentsReservationId"
      :reservation="paymentsReservation"
      @close="onPaymentsDrawerClose"
      @payments-updated="onPaymentsUpdated"
    />

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
