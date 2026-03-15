<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import {
  reservationCreateFormSchema,
  type ReservationCreateFormSchema,
} from "../../../shared/schemas/reservation";
import type { ReservationDto } from "../../../shared/types/reservation";
import {
  createClient,
  type ClientCreateInput,
} from "../../services/clientService";
import { listClients, type ClientDto } from "../../services/clientService";

type CalendarResource = {
  id: string | number;
  name?: string;
  nombre?: string;
};

type Props = {
  resource: CalendarResource;
  dateLabel?: string;
  initialStartDate?: string;
  initialValues?: Partial<ReservationDto>;
  formId?: string;
  loading?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  dateLabel: undefined,
  initialStartDate: undefined,
  initialValues: undefined,
  formId: "reservation-form",
  loading: false,
});

const emit = defineEmits<{
  submit: [
    data: {
      clientId: string | null;
      start_date: string;
      end_date: string;
      observation?: string;
      price: number;
      confirmed: boolean;
      active: boolean;
    },
  ];
  cancel: [];
}>();

const {
  data: clientsData,
  pending: clientsPending,
  error: clientsError,
  refresh: refreshClients,
} = useAsyncData<ClientDto[]>("clients-select", () => listClients());

const toast = useToast();
const { showError } = useErrorToast();

const clientDrawerOpen = ref(false);
const creatingClient = ref(false);

const clientFormId = "client-create-form";

const clients = computed(() => clientsData.value ?? []);

const clientOptions = computed(() =>
  clients.value.map((c) => ({
    label: `${c.name} ${c.last_name}`.trim(),
    value: c.id,
  })),
);

const reservationFormSchema = reservationCreateFormSchema;

type ReservationFormSchema = ReservationCreateFormSchema;

const state = reactive<{
  id_client?: string;
  start_date?: string;
  end_date?: string;
  observation?: string;
  price?: number;
  confirmed?: boolean;
  active?: boolean;
}>({
  id_client: undefined,
  start_date: undefined,
  end_date: undefined,
  observation: undefined,
  price: undefined,
  confirmed: true,
  active: true,
});

const isMaintenanceBlock = computed(() => state.active === false);

const maintenanceSwitchModel = computed<boolean>({
  get: () => isMaintenanceBlock.value,
  set: (value) => {
    state.active = value ? false : true;
  },
});

watch(
  () => state.active,
  (value) => {
    if (value === false) {
      state.id_client = undefined;
      state.confirmed = false;
    }
  },
);

watch(
  () => props.initialStartDate,
  (value) => {
    if (!value) {
      return;
    }
    state.start_date = value;
    if (!state.end_date) {
      state.end_date = value;
    }
  },
  { immediate: true },
);

watch(
  () => props.initialValues,
  (value) => {
    if (!value) {
      return;
    }
    if (typeof value.active === "boolean") {
      state.active = value.active;
    }
    if (typeof value.confirmed === "boolean") {
      state.confirmed = value.confirmed;
    }

    state.id_client = value.id_client ?? undefined;
    state.start_date = value.start_date ?? state.start_date;
    state.end_date = value.end_date ?? state.end_date;
    state.observation = value.observation ?? undefined;
    state.price = typeof value.price === "number" ? value.price : state.price;
  },
  { immediate: true },
);

function onSubmit(event: FormSubmitEvent<ReservationFormSchema>) {
  const start_date = event.data.start_date;
  const end_date = event.data.end_date;
  const active = event.data.active ?? true;
  const confirmed = event.data.confirmed ?? true;

  const price = active ? (event.data.price ?? 0) : 0;

  const clientId = active ? (event.data.id_client ?? null) : null;

  emit("submit", {
    clientId,
    start_date,
    end_date,
    observation: event.data.observation,
    price,
    confirmed,
    active,
  });
}

function onCancel() {
  emit("cancel");
}

async function onCreateClientSubmit(data: ClientCreateInput) {
  try {
    creatingClient.value = true;
    const created = await createClient(data);
    await refreshClients();
    state.id_client = created.id;
    clientDrawerOpen.value = false;

    toast.add({
      title: "Cliente creado",
      description: "Se guardó correctamente.",
      color: "success",
    });
  } catch (error: unknown) {
    showError(error, "No se pudo guardar.");
  } finally {
    creatingClient.value = false;
  }
}

const resourceName = computed(
  () => props.resource.name || props.resource.nombre || "Recurso",
);
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <div class="text-sm text-muted">Recurso</div>
      <div class="text-base font-semibold">{{ resourceName }}</div>
    </div>

    <AppErrorMessage
      v-if="clientsError"
      :error="clientsError"
      show-retry
      @retry="refreshClients()"
    />

    <UForm
      v-else
      :id="props.formId"
      :schema="reservationFormSchema"
      :state="state"
      class="space-y-5"
      @submit="onSubmit"
    >
      <div class="grid gap-4">
        <div class="grid gap-2">
          <div class="flex items-end gap-2" v-if="!isMaintenanceBlock">
            <div class="flex-1">
              <UFormField
                label="Cliente"
                name="id_client"
                :required="!isMaintenanceBlock"
              >
                <USelectMenu
                  v-model="state.id_client"
                  :items="clientOptions"
                  value-key="value"
                  :loading="clientsPending"
                  :search-input="{ placeholder: 'Buscar...' }"
                  placeholder="Seleccionar cliente..."
                  :disabled="isMaintenanceBlock"
                  class="w-full"
                />
              </UFormField>
            </div>

            <UButton
              color="neutral"
              variant="outline"
              icon="i-lucide-user-plus"
              :disabled="clientsPending || isMaintenanceBlock"
              @click="clientDrawerOpen = true"
            >
              Agregar cliente
            </UButton>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <UFormField label="Bloqueo / mantenimiento" name="active">
            <div class="flex items-center gap-3">
              <USwitch v-model="maintenanceSwitchModel" />
              <span class="text-sm text-muted">Sin cliente</span>
            </div>
          </UFormField>

          <UFormField
            v-if="!isMaintenanceBlock"
            label="Confirmada"
            name="confirmed"
          >
            <div class="flex items-center gap-3">
              <USwitch v-model="state.confirmed" />
              <span class="text-sm text-muted">Confirmada</span>
            </div>
          </UFormField>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="Desde" name="start_date" required>
            <AppDatePicker v-model="state.start_date" />
          </UFormField>
          <UFormField label="Hasta" name="end_date" required>
            <AppDatePicker
              v-model="state.end_date"
              :min-iso="state.start_date"
            />
          </UFormField>
        </div>

        <UFormField label="Precio" name="price" :required="!isMaintenanceBlock">
          <UInput
            v-model.number="state.price"
            type="number"
            step="0.01"
            min="0"
            class="w-full"
            placeholder="0.00"
            :disabled="isMaintenanceBlock"
          />
        </UFormField>

        <UFormField label="Observaciones" name="observation">
          <UTextarea
            v-model="state.observation"
            class="w-full"
            :rows="4"
            placeholder="Notas internas / comentarios..."
          />
        </UFormField>
      </div>

      <UDrawer
        v-model:open="clientDrawerOpen"
        title="Agregar cliente"
        direction="right"
        :dismissible="!creatingClient"
        :ui="{ content: 'w-[420px] sm:w-[520px] max-w-[90vw]' }"
      >
        <template #body>
          <UCard>
            <ClientForm
              :loading="creatingClient"
              :form-id="clientFormId"
              :show-actions="false"
              @submit="onCreateClientSubmit"
            />
          </UCard>
        </template>

        <template #footer>
          <div class="flex items-center justify-end gap-2">
            <UButton
              color="neutral"
              variant="outline"
              :disabled="creatingClient"
              @click="clientDrawerOpen = false"
            >
              Cancelar
            </UButton>
            <UButton
              type="submit"
              :loading="creatingClient"
              :disabled="creatingClient"
              :form="clientFormId"
            >
              Guardar
            </UButton>
          </div>
        </template>
      </UDrawer>
    </UForm>
  </div>
</template>
