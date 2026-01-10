<script setup lang="ts">
import { createReservation } from "../services/reservationService";
import type { ReservationCreateInput } from "../../shared/types/reservation";
import {
  listCalendarResources,
  type CalendarResourceDto,
} from "../services/calendarService";
type CalendarReservation = {
  id?: string;
  startDate?: string;
  endDate?: string;
  confirmed?: number;
  active?: number;
  clientFirstName?: string;
  clientLastName?: string;
};

type CalendarResource = {
  id: string | number;
  name: string;
  reservations?: CalendarReservation[];
};

type AvailableDayClickPayload = {
  resourceId: string | number;
  day: number;
  month: number;
  year: number;
};

const pad = (n: number) => String(n).padStart(2, "0");

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

const resources = computed<CalendarResource[]>(() => {
  return (resourcesData.value ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    reservations: r.reservations ?? [],
  }));
});

const reservationDrawerOpen = ref(false);
const selectedReservationResource = ref<CalendarResource | null>(null);
const selectedReservationIsoDate = ref<string | null>(null);

const reservationDateLabel = computed(() => {
  if (!selectedReservationIsoDate.value) {
    return undefined;
  }
  const [y, m, d] = selectedReservationIsoDate.value.split("-");
  if (!y || !m || !d) {
    return selectedReservationIsoDate.value;
  }
  return `${d}/${m}/${y}`;
});

function parseIsoFromCalendarClick({
  day,
  month,
  year: y,
}: AvailableDayClickPayload) {
  return `${y}-${pad(month)}-${pad(day)}`;
}

function onAvailableDayClick(payload: AvailableDayClickPayload) {
  const found = (resources.value || []).find(
    (r) => String(r.id) === String(payload.resourceId)
  );
  selectedReservationResource.value = found ?? null;

  const iso = parseIsoFromCalendarClick(payload);
  selectedReservationIsoDate.value = iso;
  reservationDrawerOpen.value = true;
}

const toast = useToast();

async function onReservationSubmit(data: {
  clientId: string | null;
  start_date: string;
  end_date: string;
  observation?: string;
  price: number;
  confirmed: boolean;
  active: boolean;
}) {
  if (!selectedReservationResource.value) {
    return;
  }

  try {
    const payload: ReservationCreateInput = {
      start_date: data.start_date,
      end_date: data.end_date,
      id_resource: String(selectedReservationResource.value.id),
      id_client: data.active ? data.clientId : null,
      observation: data.observation,
      price: data.price,
      confirmed: data.confirmed,
      active: data.active,
    };

    await createReservation(payload);

    toast.add({
      title: "Reserva",
      description: data.active
        ? `Guardada • ${data.start_date} → ${data.end_date}`
        : `Bloqueo guardado • ${data.start_date} → ${data.end_date}`,
      color: "success",
    });

    reservationDrawerOpen.value = false;

    await refreshResources();
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: err?.data?.message || err?.message || "No se pudo guardar.",
      color: "error",
    });
  }
}

function onReservationCancel() {
  reservationDrawerOpen.value = false;
}

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
    />

    <AppErrorMessage
      v-if="resourcesError"
      :error="resourcesError"
      show-retry
      @retry="refreshResources()"
    />

    <UDrawer
      v-model:open="reservationDrawerOpen"
      title="Nueva reserva"
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
          form-id="reservation-form"
          @submit="onReservationSubmit"
          @cancel="onReservationCancel"
        />
      </template>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
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
  </section>
</template>
