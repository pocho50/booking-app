<script setup>
// TODO: Implement calendar logic here

const defaultI18n = {
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
    confirmed: "Confirmado",
    active: "Activo",
    yes: "Sí",
    no: "No",
  },
};

const props = defineProps({
  resources: {
    type: Array,
    default: () => [],
  },
  month: {
    type: Number,
    default: () => new Date().getMonth() + 1,
  },
  year: {
    type: Number,
    default: () => new Date().getFullYear(),
  },
  fromYear: {
    type: Number,
    default: undefined,
  },
  toYear: {
    type: Number,
    default: undefined,
  },
  i18n: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "update:month",
  "update:year",
  "month-change",
  "reservation-click",
  "available-day-click",
]);

const i18n = computed(() => ({
  ...defaultI18n,
  ...props.i18n,
  labels: { ...defaultI18n.labels, ...(props.i18n?.labels || {}) },
  popover: { ...defaultI18n.popover, ...(props.i18n?.popover || {}) },
}));

const monthModel = computed({
  get: () => props.month,
  set: (value) => emit("update:month", value),
});

const yearModel = computed({
  get: () => props.year,
  set: (value) => emit("update:year", value),
});

const fromYearValue = computed(() => props.fromYear ?? yearModel.value - 3);
const toYearValue = computed(() => props.toYear ?? yearModel.value + 2);

const monthOptions = computed(() =>
  i18n.value.months.map((label, idx) => ({ label, value: idx + 1 }))
);

const yearOptions = computed(() => {
  const ys = [];
  for (let y = fromYearValue.value; y <= toYearValue.value; y += 1) {
    ys.push({ label: String(y), value: y });
  }
  return ys;
});

const daysInMonth = computed(() =>
  new Date(yearModel.value, monthModel.value, 0).getDate()
);

function parseIsoDate(value) {
  const [y, m, d] = String(value).split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dateToDdMmYyyy(d) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

function getReservationTitle(r) {
  if (r.activo === 0) {
    return i18n.value.labels.notAvailable;
  }
  return `${r.clienteNombre || ""} ${r.clienteApellido || ""}`.trim();
}

function buildPopoverLines(r) {
  const start = parseIsoDate(r.fechaDesde);
  const end = parseIsoDate(r.fechaHasta);
  const confirmed =
    r.confirmado === 0 ? i18n.value.popover.no : i18n.value.popover.yes;
  const active =
    r.activo === 0 ? i18n.value.popover.no : i18n.value.popover.yes;

  return [
    {
      label: i18n.value.popover.client,
      value: `${r.clienteNombre || ""} ${r.clienteApellido || ""}`.trim(),
    },
    { label: i18n.value.popover.from, value: dateToDdMmYyyy(start) },
    { label: i18n.value.popover.to, value: dateToDdMmYyyy(end) },
    { label: i18n.value.popover.confirmed, value: confirmed },
    { label: i18n.value.popover.active, value: active },
  ];
}

const days = computed(() => {
  const arr = [];
  for (let d = 1; d <= daysInMonth.value; d += 1) {
    const date = new Date(yearModel.value, monthModel.value - 1, d);
    arr.push({
      day: d,
      weekdayShort: i18n.value.daysShort[date.getDay()],
      date,
    });
  }
  return arr;
});

const resourcesWithGrid = computed(() => {
  return (props.resources || []).map((resource) => {
    const dayMap = new Map();
    for (let d = 1; d <= daysInMonth.value; d += 1) {
      dayMap.set(d, []);
    }

    (resource.reservas || []).forEach((r, reservaIdx) => {
      const reservationWithIdx = { ...r, _idx: reservaIdx };
      const start = parseIsoDate(r.fechaDesde);
      const end = parseIsoDate(r.fechaHasta);

      for (let d = 1; d <= daysInMonth.value; d += 1) {
        const current = new Date(yearModel.value, monthModel.value - 1, d);
        if (current >= start && current <= end) {
          dayMap.get(d).push(reservationWithIdx);
        }
      }
    });

    const cells = days.value.map(({ day }) => {
      const reservations = dayMap.get(day) || [];
      const hasInactive = reservations.some((r) => r.activo === 0);
      const hasActive = reservations.some((r) => r.activo !== 0);

      return {
        day,
        reservations,
        isUnavailable: hasInactive,
        isAvailable: !hasActive && !hasInactive,
      };
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

  resourcesWithGrid.value.forEach((r) => {
    r.cells.forEach((c) => {
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

async function reloadData(nextMes, nextYear) {
  emit("month-change", { mes: nextMes, year: nextYear });
}

async function goNext() {
  const nextMes = monthModel.value === 12 ? 1 : monthModel.value + 1;
  const nextYear =
    monthModel.value === 12 ? yearModel.value + 1 : yearModel.value;
  monthModel.value = nextMes;
  yearModel.value = nextYear;
  await reloadData(nextMes, nextYear);
}

async function goPrev() {
  const prevMes = monthModel.value === 1 ? 12 : monthModel.value - 1;
  const prevYear =
    monthModel.value === 1 ? yearModel.value - 1 : yearModel.value;
  monthModel.value = prevMes;
  yearModel.value = prevYear;
  await reloadData(prevMes, prevYear);
}

async function onSelectChange() {
  await reloadData(monthModel.value, yearModel.value);
}

function onAvailableCellClick(resourceId, day) {
  emit("available-day-click", {
    idRecurso: resourceId,
    dia: day,
    mes: monthModel.value,
    year: yearModel.value,
  });
}

function onReservationClick(reservation, resourceId) {
  emit("reservation-click", {
    reservaId: reservation.id ?? null,
    reservation,
    idRecurso: resourceId,
    mes: monthModel.value,
    year: yearModel.value,
  });
}

function getReservationButtonColor(reservation) {
  if (reservation.activo === 0) {
    return "neutral";
  }
  if (reservation.confirmado === 0) {
    return "error";
  }
  const parity =
    typeof reservation._idx === "number" ? reservation._idx % 2 : 0;
  return parity === 0 ? "primary" : "secondary";
}

function getReservationButtonUi(reservation) {
  if (reservation.activo === 0) {
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
              Recurso
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
              {{ resource.nombre }}
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
                  :key="r.id ?? `${r._idx}-${r.fechaDesde}-${r.fechaHasta}`"
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
                    <div class="w-72 p-3 text-sm">
                      <div class="mb-2 font-semibold">
                        {{ getReservationTitle(r) }}
                      </div>
                      <div class="space-y-1">
                        <div
                          v-for="line in buildPopoverLines(r)"
                          :key="line.label"
                        >
                          <span class="font-semibold">{{ line.label }}:</span>
                          <span> {{ line.value }}</span>
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
