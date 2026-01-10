<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import AppDatePicker from "../App/AppDatePicker.vue";
import ClientForm from "../Client/ClientForm.vue";
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
  formId?: string;
  loading?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  dateLabel: undefined,
  initialStartDate: undefined,
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
    }
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

const clientDrawerOpen = ref(false);
const creatingClient = ref(false);

const clientFormId = "client-create-form";

const clients = computed(() => clientsData.value ?? []);

const clientOptions = computed(() =>
  clients.value.map((c) => ({
    label: `${c.name} ${c.last_name}`.trim(),
    value: c.id,
  }))
);

const state = reactive<{
  clientId?: string;
  start_date?: string;
  end_date?: string;
  observation?: string;
  price?: number;
  confirmed?: boolean;
  active?: boolean;
}>({
  clientId: undefined,
  start_date: undefined,
  end_date: undefined,
  observation: undefined,
  price: undefined,
  confirmed: false,
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
      state.clientId = undefined;
      state.confirmed = false;
    }
  }
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
  { immediate: true }
);

function onSubmit(
  event: FormSubmitEvent<{
    clientId?: string;
    start_date?: string;
    end_date?: string;
    observation?: string;
    price?: number;
    confirmed?: boolean;
    active?: boolean;
  }>
) {
  const start_date = event.data.start_date;
  const end_date = event.data.end_date;
  const price = event.data.price;
  const active = event.data.active ?? true;
  const confirmed = event.data.confirmed ?? false;

  const clientId = active ? event.data.clientId ?? null : null;

  if (!start_date || !end_date || typeof price !== "number") {
    return;
  }

  if (active && !clientId) {
    return;
  }

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
    state.clientId = created.id;
    clientDrawerOpen.value = false;

    toast.add({
      title: "Cliente creado",
      description: "Se guardó correctamente.",
      color: "success",
    });
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: err?.data?.message || err?.message || "No se pudo guardar.",
      color: "error",
    });
  } finally {
    creatingClient.value = false;
  }
}

const resourceName = computed(
  () => props.resource.name || props.resource.nombre || "Recurso"
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
                name="clientId"
                :required="!isMaintenanceBlock"
              >
                <USelect
                  v-model="state.clientId"
                  :items="clientOptions"
                  value-key="value"
                  :loading="clientsPending"
                  placeholder="Selecciona un cliente"
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

        <UFormField label="Precio" name="price" required>
          <UInput
            v-model.number="state.price"
            type="number"
            step="0.01"
            min="0"
            class="w-full"
            placeholder="0.00"
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
