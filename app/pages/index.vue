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
  deleteModalOpen,
  deleting,
  reservationDateLabel,
  drawerTitle,
  onAvailableDayClick,
  onReservationEdit,
  onReservationSubmit,
  onReservationCancel,
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
