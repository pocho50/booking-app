<script setup lang="ts">
import type {
  CalendarReservationDto,
  CalendarResourceDto,
} from "../../../shared/types/calendar";

type CalendarReservation = CalendarReservationDto & {
  _idx?: number;
};

type CalendarResource = CalendarResourceDto;

type CalendarCell = {
  day: number;
  reservations: CalendarReservation[];
  isUnavailable: boolean;
  isAvailable: boolean;
};

type CalendarResourceWithGrid = CalendarResource & {
  cells: CalendarCell[];
};

type CalendarI18n = {
  daysShort: string[];
  months: string[];
  labels: {
    previous: string;
    next: string;
    details: string;
    notAvailable: string;
    loading: string;
  };
  popover: {
    client: string;
    from: string;
    to: string;
    price: string;
    confirmed: string;
    active: string;
    yes: string;
    no: string;
  };
};

type ReservationClickPayload = {
  reservationId: string | null;
  reservation: CalendarReservation;
  resourceId: string;
  month: number;
  year: number;
};

type ReservationEditPayload = ReservationClickPayload;

type AvailableDayClickPayload = {
  resourceId: string;
  day: number;
  month: number;
  year: number;
};

type MonthChangePayload = {
  month: number;
  year: number;
};

const defaultI18n: CalendarI18n = {
  daysShort: ["DO", "LU", "MA", "MI", "JU", "VI", "SA"],
  months: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
  labels: {
    previous: "Anterior",
    next: "Siguiente",
    details: "Detalle",
    notAvailable: "No disponible",
    loading: "Cargando",
  },
  popover: {
    client: "Cliente",
    from: "Desde",
    to: "Hasta",
    price: "Precio",
    confirmed: "Confirmado",
    active: "Activo",
    yes: "Sí",
    no: "No",
  },
};

type Props = {
  resources?: CalendarResourceDto[];
  month?: number;
  year?: number;
  fromYear?: number;
  toYear?: number;
  i18n?: Partial<CalendarI18n>;
  loading?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  resources: () => [] as CalendarResourceDto[],
  month: () => new Date().getMonth() + 1,
  year: () => new Date().getFullYear(),
  fromYear: undefined,
  toYear: undefined,
  i18n: () => ({}),
  loading: false,
});

const emit = defineEmits<{
  "update:month": [value: number];
  "update:year": [value: number];
  "month-change": [payload: MonthChangePayload];
  "reservation-click": [payload: ReservationClickPayload];
  "reservation-edit": [payload: ReservationEditPayload];
  "available-day-click": [payload: AvailableDayClickPayload];
}>();

const i18n = computed<CalendarI18n>(() => ({
  ...defaultI18n,
  ...props.i18n,
  labels: { ...defaultI18n.labels, ...(props.i18n?.labels || {}) },
  popover: { ...defaultI18n.popover, ...(props.i18n?.popover || {}) },
}));

const monthModel = computed<number>({
  get: () => props.month ?? new Date().getMonth() + 1,
  set: (value) => emit("update:month", value),
});

const yearModel = computed<number>({
  get: () => props.year ?? new Date().getFullYear(),
  set: (value) => emit("update:year", value),
});

const fromYearValue = computed(() => props.fromYear ?? yearModel.value - 3);
const toYearValue = computed(() => props.toYear ?? yearModel.value + 2);

const monthOptions = computed(() =>
  i18n.value.months.map((label, idx) => ({ label, value: idx + 1 }))
);

const yearOptions = computed(() => {
  const ys: Array<{ label: string; value: number }> = [];
  for (let y = fromYearValue.value; y <= toYearValue.value; y += 1) {
    ys.push({ label: String(y), value: y });
  }
  return ys;
});

const daysInMonth = computed(() =>
  new Date(yearModel.value, monthModel.value, 0).getDate()
);

function parseIsoDate(value: string) {
  const parts = String(value).split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) {
    return new Date(NaN);
  }
  const [y, m, d] = parts as [number, number, number];
  return new Date(y, m - 1, d);
}

function dateToDdMmYyyy(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

function getReservationTitle(r: CalendarReservation) {
  if (r.active === 0) {
    return i18n.value.labels.notAvailable;
  }
  return `${r.clientFirstName || ""} ${r.clientLastName || ""}`.trim();
}

function buildPopoverLines(r: CalendarReservation) {
  const start = parseIsoDate(r.startDate);
  const end = parseIsoDate(r.endDate);
  const confirmed =
    r.confirmed === 0 ? i18n.value.popover.no : i18n.value.popover.yes;
  const active =
    r.active === 0 ? i18n.value.popover.no : i18n.value.popover.yes;

  return [
    {
      label: i18n.value.popover.client,
      value: `${r.clientFirstName || ""} ${r.clientLastName || ""}`.trim(),
    },
    { label: i18n.value.popover.from, value: dateToDdMmYyyy(start) },
    { label: i18n.value.popover.to, value: dateToDdMmYyyy(end) },
    {
      label: i18n.value.popover.price,
      value: new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
      }).format(r.price),
    },
    { label: i18n.value.popover.confirmed, value: confirmed },
    { label: i18n.value.popover.active, value: active },
  ];
}

const days = computed(() => {
  const arr: Array<{ day: number; weekdayShort: string; date: Date }> = [];
  for (let d = 1; d <= daysInMonth.value; d += 1) {
    const date = new Date(yearModel.value, monthModel.value - 1, d);
    arr.push({
      day: d,
      weekdayShort: i18n.value.daysShort[date.getDay()] ?? "",
      date,
    });
  }
  return arr;
});

const resourcesWithGrid = computed<CalendarResourceWithGrid[]>(() => {
  return (props.resources || []).map((resource: CalendarResourceDto) => {
    const dayMap = new Map<number, CalendarReservation[]>();
    for (let d = 1; d <= daysInMonth.value; d += 1) {
      dayMap.set(d, []);
    }

    (resource.reservations || []).forEach(
      (r: CalendarReservationDto, idx: number) => {
        const reservationWithIdx: CalendarReservation = { ...r, _idx: idx };
        const start = parseIsoDate(r.startDate);
        const end = parseIsoDate(r.endDate);

        for (let d = 1; d <= daysInMonth.value; d += 1) {
          const current = new Date(yearModel.value, monthModel.value - 1, d);
          if (current >= start && current <= end) {
            dayMap.get(d)?.push(reservationWithIdx);
          }
        }
      }
    );

    const cells = days.value.map(({ day }) => {
      const reservations = dayMap.get(day) || [];
      const hasInactive = reservations.some((r) => r.active === 0);
      const hasActive = reservations.some((r) => r.active !== 0);

      const cell: CalendarCell = {
        day,
        reservations,
        isUnavailable: hasInactive,
        isAvailable: !hasActive && !hasInactive,
      };
      return cell;
    });

    return { ...resource, cells };
  });
});

const occupancy = computed(() => {
  const resourceCount = (props.resources || []).length;
  if (!resourceCount) {
    return "0.00%";
  }

  let inactiveDaysTotal = 0;
  let reservedDaysTotal = 0;

  resourcesWithGrid.value.forEach((r: CalendarResourceWithGrid) => {
    r.cells.forEach((c: CalendarCell) => {
      if (c.isUnavailable) {
        inactiveDaysTotal += 1;
        return;
      }
      if (!c.isAvailable) {
        reservedDaysTotal += 1;
      }
    });
  });

  const totalAvailableDays =
    daysInMonth.value * resourceCount - inactiveDaysTotal;
  if (!totalAvailableDays) {
    return "0.00%";
  }

  return `${((reservedDaysTotal * 100) / totalAvailableDays).toFixed(2)}%`;
});

async function reloadData(nextMonth: number, nextYear: number) {
  emit("month-change", { month: nextMonth, year: nextYear });
}

async function goNext() {
  const nextMonth = monthModel.value === 12 ? 1 : monthModel.value + 1;
  const nextYear =
    monthModel.value === 12 ? yearModel.value + 1 : yearModel.value;
  monthModel.value = nextMonth;
  yearModel.value = nextYear;
  await reloadData(nextMonth, nextYear);
}

async function goPrev() {
  const prevMonth = monthModel.value === 1 ? 12 : monthModel.value - 1;
  const prevYear =
    monthModel.value === 1 ? yearModel.value - 1 : yearModel.value;
  monthModel.value = prevMonth;
  yearModel.value = prevYear;
  await reloadData(prevMonth, prevYear);
}

async function onSelectChange() {
  await reloadData(monthModel.value, yearModel.value);
}

function onAvailableCellClick(resourceId: string, day: number) {
  emit("available-day-click", {
    resourceId,
    day,
    month: monthModel.value,
    year: yearModel.value,
  });
}

function onReservationEdit(
  reservation: CalendarReservation,
  resourceId: string
) {
  emit("reservation-edit", {
    reservationId: reservation.id ?? null,
    reservation,
    resourceId,
    month: monthModel.value,
    year: yearModel.value,
  });
}

function onReservationClick(
  reservation: CalendarReservation,
  resourceId: string
) {
  emit("reservation-click", {
    reservationId: reservation.id ?? null,
    reservation,
    resourceId,
    month: monthModel.value,
    year: yearModel.value,
  });
}

function getReservationButtonColor(reservation: CalendarReservation) {
  if (reservation.active === 0) {
    return "neutral";
  }
  if (reservation.confirmed === 0) {
    return "error";
  }
  const parity =
    typeof reservation._idx === "number" ? reservation._idx % 2 : 0;
  return parity === 0 ? "primary" : "secondary";
}

function getReservationButtonUi(reservation: CalendarReservation) {
  if (reservation.active === 0) {
    return { leadingIcon: "!text-dimmed" };
  }
  return undefined;
}
</script>

<template>
  <div class="relative">
    <div
      v-if="props.loading"
      class="absolute inset-0 z-20 flex items-center justify-center bg-default/70 backdrop-blur-sm"
    >
      <div class="flex items-center gap-3 text-sm text-muted">
        <span
          class="h-5 w-5 animate-spin rounded-full border-2 border-default border-t-primary"
        />
        <span>{{ i18n.labels.loading }}</span>
      </div>
    </div>

    <div
      class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex items-center gap-2">
        <UButton size="sm" color="neutral" variant="outline" @click="goPrev">
          {{ i18n.labels.previous }}
        </UButton>

        <div class="flex items-center gap-2">
          <USelect
            v-model="monthModel"
            :items="monthOptions"
            value-key="value"
            size="sm"
            @update:model-value="onSelectChange"
          />

          <USelect
            v-model="yearModel"
            :items="yearOptions"
            value-key="value"
            size="sm"
            @update:model-value="onSelectChange"
          />
        </div>

        <UButton size="sm" color="neutral" variant="outline" @click="goNext">
          {{ i18n.labels.next }}
        </UButton>
      </div>

      <div class="text-sm text-muted">{{ occupancy }}</div>
    </div>

    <div class="overflow-auto rounded-lg border border-default">
      <table class="w-full border-collapse bg-default text-sm text-default">
        <thead class="sticky top-0 z-10 bg-elevated/60">
          <tr>
            <th class="min-w-56 border border-default px-2 py-2 text-left">
              Resource
            </th>
            <th
              v-for="d in days"
              :key="`day-num-${d.day}`"
              class="min-w-10 border border-default px-2 py-2 text-center text-xs text-muted"
            >
              {{ d.day }}
            </th>
          </tr>
          <tr>
            <th
              class="border border-default px-2 py-1 text-left text-xs text-muted"
            >
              &nbsp;
            </th>
            <th
              v-for="d in days"
              :key="`day-week-${d.day}`"
              class="border border-default px-2 py-1 text-center text-xs text-muted"
            >
              {{ d.weekdayShort }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="resource in resourcesWithGrid" :key="resource.id">
            <td class="border border-default px-2 py-2 font-semibold">
              {{ resource.name }}
            </td>

            <td
              v-for="cell in resource.cells"
              :key="`${resource.id}-${cell.day}`"
              class="border border-default px-1 py-1 align-middle focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              :class="{
                'bg-red-50 dark:bg-red-950/30': cell.isUnavailable,
                'bg-default hover:bg-sky-200/60 dark:hover:bg-sky-900/40 cursor-pointer transition-colors':
                  cell.isAvailable,
              }"
              :tabindex="cell.isAvailable ? 0 : -1"
              @keydown.enter.prevent="
                cell.isAvailable
                  ? onAvailableCellClick(resource.id, cell.day)
                  : undefined
              "
              @keydown.space.prevent="
                cell.isAvailable
                  ? onAvailableCellClick(resource.id, cell.day)
                  : undefined
              "
              @click="
                cell.isAvailable
                  ? onAvailableCellClick(resource.id, cell.day)
                  : undefined
              "
            >
              <div class="flex items-center justify-center gap-1">
                <UPopover
                  :arrow="{ width: 20, height: 10 }"
                  v-for="r in cell.reservations"
                  :key="r.id ?? `${r._idx}-${r.startDate}-${r.endDate}`"
                  :content="{
                    side: cell.day < 16 ? 'right' : 'left',
                    sideOffset: 8,
                  }"
                >
                  <UButton
                    size="xs"
                    :color="getReservationButtonColor(r)"
                    variant="ghost"
                    icon="i-lucide-home"
                    :ui="getReservationButtonUi(r)"
                    :aria-label="`${i18n.labels.details}: ${getReservationTitle(
                      r
                    )}`"
                    @click.stop="onReservationClick(r, resource.id)"
                  />

                  <template #content>
                    <div class="w-96 p-5">
                      <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                          <div
                            class="truncate text-base font-semibold text-highlighted"
                          >
                            {{ getReservationTitle(r) }}
                          </div>
                        </div>

                        <UButton
                          v-if="r.id"
                          size="xs"
                          color="neutral"
                          variant="ghost"
                          icon="i-lucide-pencil"
                          :aria-label="'Editar'"
                          @click.stop="onReservationEdit(r, resource.id)"
                        />
                      </div>

                      <div
                        class="mt-4 rounded-md border border-default bg-elevated/40 p-4"
                      >
                        <div class="flex items-center justify-between gap-3">
                          <div class="text-sm text-muted">
                            {{ i18n.popover.from }} → {{ i18n.popover.to }}
                          </div>
                          <div class="text-base font-semibold text-highlighted">
                            {{
                              new Intl.NumberFormat("es-ES", {
                                style: "currency",
                                currency: "EUR",
                              }).format(r.price)
                            }}
                          </div>
                        </div>
                        <div class="mt-1 text-base">
                          <span class="font-medium">
                            {{ buildPopoverLines(r)[1]?.value }}
                          </span>
                          <span class="text-muted"> → </span>
                          <span class="font-medium">
                            {{ buildPopoverLines(r)[2]?.value }}
                          </span>
                        </div>
                      </div>

                      <div class="mt-4 grid gap-2 text-sm">
                        <div class="flex items-center justify-between gap-3">
                          <span class="text-muted">{{
                            i18n.popover.client
                          }}</span>
                          <span class="truncate font-medium">{{
                            `${r.clientFirstName || ""} ${
                              r.clientLastName || ""
                            }`.trim() || "-"
                          }}</span>
                        </div>
                        <div class="flex items-center justify-between gap-3">
                          <span class="text-muted">{{
                            i18n.popover.confirmed
                          }}</span>
                          <UBadge
                            size="sm"
                            variant="subtle"
                            :color="r.confirmed === 0 ? 'warning' : 'success'"
                          >
                            {{
                              r.confirmed === 0
                                ? i18n.popover.no
                                : i18n.popover.yes
                            }}
                          </UBadge>
                        </div>
                        <div class="flex items-center justify-between gap-3">
                          <span class="text-muted">{{
                            i18n.popover.active
                          }}</span>
                          <UBadge
                            size="sm"
                            variant="subtle"
                            :color="r.active === 0 ? 'neutral' : 'success'"
                          >
                            {{
                              r.active === 0
                                ? i18n.popover.no
                                : i18n.popover.yes
                            }}
                          </UBadge>
                        </div>
                      </div>
                    </div>
                  </template>
                </UPopover>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
