<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";
import {
  deleteReservation,
  getReservation,
} from "../../services/reservationService";
import {
  listResources,
  type ResourceDto,
} from "../../services/resourceService";
import type { ReservationDto } from "../../../shared/types/reservation";
import { formatMoney } from "../../../shared/utils/moneyFormat";
import { useReservationBalance } from "../../composables/useReservationBalance";

const route = useRoute();
const id = computed(() => String(route.params.id));

const {
  data: reservation,
  pending,
  refresh,
  error,
} = await useAsyncData<ReservationDto>(
  () => `reservation-${id.value}`,
  () => getReservation(id.value)
);

const reservationPrice = computed(() => reservation.value?.price ?? 0);

const { billingsPending, saldo, onBillingsTotalChange } =
  useReservationBalance(reservationPrice);

const { data: resourcesData } = await useAsyncData<ResourceDto[]>(
  "resources-for-reservation-detail",
  () => listResources()
);

const resources = computed(() => resourcesData.value ?? []);

const resourceForForm = computed(() => {
  const res = reservation.value;
  if (!res) {
    return { id: "", name: "" };
  }

  const resource = resources.value.find((r) => r.id === res.id_resource);
  return {
    id: res.id_resource,
    name: resource?.name ?? "Recurso",
  };
});

const saving = ref(false);
const deleting = ref(false);
const deleteModalOpen = ref(false);
const toast = useToast();

const formId = "reservation-detail-form";

const activeTab = ref<"info" | "billings">("info");

const tabItems = computed<TabsItem[]>(() => [
  { label: "Información", value: "info", slot: "info" },
  { label: "Cobros", value: "billings", slot: "billings" },
]);

function requestDelete() {
  deleteModalOpen.value = true;
}

async function confirmDelete() {
  try {
    deleting.value = true;
    await deleteReservation(id.value);
    toast.add({
      title: "Reserva eliminada",
      description: "Se eliminó correctamente.",
      color: "success",
    });
    await navigateTo("/reservas");
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: err?.data?.message || err?.message || "No se pudo eliminar.",
      color: "error",
    });
  } finally {
    deleting.value = false;
    deleteModalOpen.value = false;
  }
}

const deleteDescription = computed(() => {
  if (!reservation.value) {
    return undefined;
  }
  return "¿Eliminar la reserva? Esta acción no se puede deshacer.";
});
</script>

<template>
  <section class="py-8">
    <div class="mx-auto w-full max-w-4xl space-y-6">
      <div
        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 class="text-2xl font-semibold">Editar reserva</h1>
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2 text-sm text-muted">
              <span class="font-medium text-foreground">Saldo:</span>
              <UBadge
                :color="saldo <= 0 ? 'success' : 'error'"
                variant="subtle"
                class="px-2.5 py-1 text-sm font-semibold"
              >
                {{ formatMoney(saldo) }}
              </UBadge>
              <span v-if="billingsPending" class="text-dimmed"
                >(calculando...)</span
              >
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <UButton color="neutral" variant="outline" to="/reservas">
            Volver
          </UButton>
          <UButton color="neutral" variant="outline" @click="refresh()">
            Recargar
          </UButton>
          <UButton
            color="error"
            variant="outline"
            :loading="deleting"
            :disabled="deleting || saving"
            @click="requestDelete"
          >
            Eliminar
          </UButton>
        </div>
      </div>

      <AppLoading v-if="pending" />
      <AppErrorMessage
        v-else-if="error"
        :error="error"
        show-retry
        @retry="refresh()"
      />

      <UCard v-else>
        <div class="flex flex-col gap-4">
          <UTabs
            v-model="activeTab"
            :items="tabItems"
            color="info"
            variant="pill"
            :unmount-on-hide="false"
            class="w-full"
          >
            <template #info>
              <ReservationDetailInfoTab
                v-if="reservation"
                :reservation-id="id"
                :resource="resourceForForm"
                :reservation="reservation"
                :form-id="formId"
                :disabled="deleting"
                @saving-change="(v) => (saving = v)"
                @saved="refresh()"
              />
            </template>

            <template #billings>
              <ReservationDetailBillingsTab
                :reservation-id="id"
                @billings-total-change="onBillingsTotalChange"
              />
            </template>
          </UTabs>
        </div>
      </UCard>

      <AppConfirmModal
        v-model="deleteModalOpen"
        title="Eliminar reserva"
        :description="deleteDescription"
        confirm-label="Eliminar"
        confirm-color="error"
        :loading="deleting"
        @confirm="confirmDelete"
      />
    </div>
  </section>
</template>
