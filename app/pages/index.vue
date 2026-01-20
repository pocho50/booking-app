<script setup lang="ts">
import { listCalendarResources } from "../services/calendarService";
import type {
  CalendarReservationDto,
  CalendarResourceDto,
} from "../../shared/types/calendar";
import type { ReservationDto } from "../../shared/types/reservation";
import { formatIsoDateTo } from "../../shared/utils/dateFormat";
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

function mapReservationToCalendarDto(
  reservation: ReservationDto,
): CalendarReservationDto {
  return {
    id: reservation.id,
    startDate: reservation.start_date,
    endDate: reservation.end_date,
    confirmed: reservation.confirmed ? 1 : 0,
    active: reservation.active ? 1 : 0,
    price: reservation.price,
    saldo: reservation.saldo,
  };
}

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
      description="Formulario para crear o editar la reserva seleccionada."
      direction="right"
      :dismissible="true"
      :ui="{ content: 'w-[420px] sm:w-[520px] max-w-[90vw]' }"
    >
      <template #body>
        <div
          v-if="
            reservationInitialValues &&
            editingReservationId &&
            reservationInitialValues.active
          "
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
                      0,
                  )
                }}
              </div>
            </div>
            <UButton
              size="xs"
              color="neutral"
              variant="outline"
              @click="
                openBillingsById(
                  editingReservationId,
                  mapReservationToCalendarDto(reservationInitialValues),
                )
              "
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
      description="Listado y formulario de cobros de la reserva."
      direction="right"
      :dismissible="true"
      :ui="{ content: 'w-[520px] sm:w-[680px] max-w-[90vw]' }"
      @close="onBillingsDrawerClose"
    >
      <template #body>
        <div v-if="billingsReservationId" class="space-y-4">
          <div
            v-if="billingsReservation"
            class="rounded-lg border border-default bg-elevated/40 p-4"
          >
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div class="text-xs uppercase tracking-wide text-muted">
                  Saldo
                </div>
                <div class="text-lg font-semibold text-highlighted">
                  {{
                    formatMoney(
                      billingsReservation.saldo ??
                        billingsReservation.price ??
                        0,
                    )
                  }}
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <UBadge
                  size="sm"
                  variant="subtle"
                  :color="
                    billingsReservation.confirmed === 0 ? 'warning' : 'success'
                  "
                >
                  {{
                    billingsReservation.confirmed === 0
                      ? "No confirmado"
                      : "Confirmado"
                  }}
                </UBadge>
                <UBadge
                  size="sm"
                  variant="subtle"
                  :color="
                    billingsReservation.active === 0 ? 'neutral' : 'success'
                  "
                >
                  {{ billingsReservation.active === 0 ? "Inactivo" : "Activo" }}
                </UBadge>
              </div>
            </div>
            <div class="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div class="flex items-center gap-3">
                <span class="text-muted">Inicio</span>
                <span class="font-medium">
                  {{
                    billingsReservation.startDate
                      ? formatIsoDateTo(billingsReservation.startDate)
                      : "-"
                  }}
                </span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-muted">Fin</span>
                <span class="font-medium">
                  {{
                    billingsReservation.endDate
                      ? formatIsoDateTo(billingsReservation.endDate)
                      : "-"
                  }}
                </span>
              </div>
            </div>
          </div>
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
