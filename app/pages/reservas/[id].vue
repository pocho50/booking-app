<script setup lang="ts">
import {
  deleteReservation,
  getReservation,
  updateReservation,
} from "../../services/reservationService";
import {
  listResources,
  type ResourceDto,
} from "../../services/resourceService";
import type {
  ReservationDto,
  ReservationUpdateInput,
} from "../../../shared/types/reservation";

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

async function onSubmit(data: {
  clientId: string | null;
  start_date: string;
  end_date: string;
  observation?: string;
  price: number;
  confirmed: boolean;
  active: boolean;
}) {
  try {
    saving.value = true;

    const input: ReservationUpdateInput = {
      id_client: data.clientId,
      start_date: data.start_date,
      end_date: data.end_date,
      observation: data.observation,
      price: data.price,
      confirmed: data.confirmed,
      active: data.active,
    };

    await updateReservation(id.value, input);
    toast.add({
      title: "Cambios guardados",
      description: "La reserva se actualizó correctamente.",
      color: "success",
    });
    await refresh();
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: err?.data?.message || err?.message || "No se pudo guardar.",
      color: "error",
    });
  } finally {
    saving.value = false;
  }
}

function onCancel() {
  navigateTo("/reservas");
}

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
          <p class="text-sm text-muted">Editar o eliminar la reserva.</p>
        </div>

        <div class="flex items-center gap-2">
          <UButton color="neutral" variant="outline" to="/reservas">
            Volver
          </UButton>
          <UButton color="neutral" variant="outline" @click="refresh()">
            Recargar
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
        <ReservationForm
          :resource="resourceForForm"
          :form-id="formId"
          :initial-values="reservation"
          :loading="saving"
          @submit="onSubmit"
          @cancel="onCancel"
        />
      </UCard>

      <div
        v-if="!pending && !error"
        class="flex items-center justify-end gap-2"
      >
        <UButton
          color="error"
          variant="outline"
          :loading="deleting"
          :disabled="deleting || saving"
          @click="requestDelete"
        >
          Eliminar
        </UButton>
        <UButton
          color="neutral"
          variant="outline"
          :disabled="saving || deleting"
          @click="onCancel"
        >
          Cancelar
        </UButton>
        <UButton
          type="submit"
          :form="formId"
          :loading="saving"
          :disabled="saving || deleting"
        >
          Guardar cambios
        </UButton>
      </div>

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
