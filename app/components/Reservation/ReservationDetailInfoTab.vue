<script setup lang="ts">
import { updateReservation } from "../../services/reservationService";

type CalendarResource = {
  id: string | number;
  name?: string;
  nombre?: string;
};

type Props = {
  reservationId: string;
  resource: CalendarResource;
  reservation: ReservationDto;
  formId: string;
  loading?: boolean;
  disabled?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  disabled: false,
});

const emit = defineEmits<{
  "saving-change": [saving: boolean];
  saved: [];
}>();

const toast = useToast();
const { showError } = useErrorToast();
const saving = ref(false);

watch(
  saving,
  (value) => {
    emit("saving-change", value);
  },
  { immediate: true },
);

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

    await updateReservation(props.reservationId, input);
    toast.add({
      title: "Cambios guardados",
      description: "La reserva se actualizó correctamente.",
      color: "success",
    });
    emit("saved");
  } catch (error: unknown) {
    showError(error, "No se pudo guardar.");
  } finally {
    saving.value = false;
  }
}

function onCancel() {
  navigateTo("/reservas");
}
</script>

<template>
  <div class="space-y-6">
    <ReservationForm
      :resource="resource"
      :form-id="formId"
      :initial-values="reservation"
      :loading="loading || saving"
      @submit="onSubmit"
      @cancel="onCancel"
    />

    <div class="flex items-center justify-end gap-2">
      <UButton
        color="neutral"
        variant="outline"
        :disabled="disabled || saving"
        @click="onCancel"
      >
        Cancelar
      </UButton>
      <UButton
        type="submit"
        :form="formId"
        :loading="saving"
        :disabled="disabled || saving"
      >
        Guardar cambios
      </UButton>
    </div>
  </div>
</template>
