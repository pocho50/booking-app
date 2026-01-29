<script setup lang="ts">
import type { CalendarReservationDto } from "../../../shared/types/calendar";
import { formatIsoDateTo } from "../../../shared/utils/dateFormat";
import { formatMoney } from "../../../shared/utils/moneyFormat";

const open = defineModel<boolean>("open", { default: false });

type Props = {
  title: string;
  reservationId: string | null;
  reservation: CalendarReservationDto | null;
};

defineProps<Props>();

const emit = defineEmits<{
  close: [];
  paymentsUpdated: [];
}>();
</script>

<template>
  <UDrawer
    v-model:open="open"
    :title="title"
    description="Listado y formulario de pagos de la reserva."
    direction="right"
    :dismissible="true"
    :ui="{ content: 'w-[520px] sm:w-[680px] max-w-[90vw]' }"
    @close="emit('close')"
  >
    <template #body>
      <div v-if="reservationId" class="space-y-4">
        <div
          v-if="reservation"
          class="rounded-lg border border-default bg-elevated/40 p-4"
        >
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div class="text-xs uppercase tracking-wide text-muted">Saldo</div>
              <div class="text-lg font-semibold text-highlighted">
                {{ formatMoney(reservation.saldo ?? reservation.price ?? 0) }}
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <UBadge
                size="sm"
                variant="subtle"
                :color="reservation.confirmed === 0 ? 'warning' : 'success'"
              >
                {{ reservation.confirmed === 0 ? "No confirmado" : "Confirmado" }}
              </UBadge>
              <UBadge
                size="sm"
                variant="subtle"
                :color="reservation.active === 0 ? 'neutral' : 'success'"
              >
                {{ reservation.active === 0 ? "Inactivo" : "Activo" }}
              </UBadge>
            </div>
          </div>
          <div class="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div class="flex items-center gap-3">
              <span class="text-muted">Inicio</span>
              <span class="font-medium">
                {{
                  reservation.startDate
                    ? formatIsoDateTo(reservation.startDate)
                    : "-"
                }}
              </span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-muted">Fin</span>
              <span class="font-medium">
                {{ reservation.endDate ? formatIsoDateTo(reservation.endDate) : "-" }}
              </span>
            </div>
          </div>
        </div>

        <ReservationDetailPaymentsTab
          :reservation-id="reservationId"
          @payments-updated="emit('paymentsUpdated')"
        />
      </div>
      <div v-else class="text-sm text-muted">No hay reserva.</div>
    </template>

    <template #footer>
      <div class="flex items-center justify-end">
        <UButton color="neutral" variant="outline" @click="emit('close')">
          Cerrar
        </UButton>
      </div>
    </template>
  </UDrawer>
</template>
