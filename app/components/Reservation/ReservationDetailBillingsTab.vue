<script setup lang="ts">
import type { FormSubmitEvent, TableColumn } from "@nuxt/ui";
import { h, resolveComponent } from "vue";
import type {
  BillingCreateForReservationInput,
  BillingDto,
} from "../../../shared/types/billing";
import {
  billingCreateForReservationSchema,
  type BillingCreateSchema,
} from "../../../shared/schemas/billing";
import { formatIsoDateTo } from "../../../shared/utils/dateFormat";
import { formatMoney } from "../../../shared/utils/moneyFormat";

type Props = {
  reservationId: string;
};

const props = defineProps<Props>();

const emit = defineEmits<{
  billingsTotalChange: [payload: { total: number; pending: boolean }];
}>();

const toast = useToast();

const reservationIdRef = computed(() => props.reservationId);

const {
  billings,
  pending,
  status,
  error,
  refresh,
  creating,
  deleting,
  create,
  remove,
} = useReservationBillings(reservationIdRef);

const billingsTotal = computed(() =>
  billings.value.reduce((acc, b) => acc + (b.amount ?? 0), 0)
);

watchEffect(() => {
  emit("billingsTotalChange", {
    total: billingsTotal.value,
    pending: pending.value,
  });
});

type BillingFormSchema = Omit<BillingCreateSchema, "id_reservation">;

const billingState = reactive<Partial<BillingFormSchema>>({
  date: undefined,
  amount: undefined,
  observations: undefined,
});

const deleteModalOpen = ref(false);
const billingToDelete = ref<BillingDto | null>(null);

const deleteDescription = computed(() => {
  if (!billingToDelete.value) {
    return undefined;
  }
  return "¿Eliminar el cobro? Esta acción no se puede deshacer.";
});

function requestDelete(item: BillingDto) {
  billingToDelete.value = item;
  deleteModalOpen.value = true;
}

async function confirmDelete() {
  if (!billingToDelete.value) {
    deleteModalOpen.value = false;
    return;
  }

  try {
    await remove(billingToDelete.value.id);
    toast.add({
      title: "Cobro eliminado",
      description: "Se eliminó correctamente.",
      color: "success",
    });
    billingToDelete.value = null;
    deleteModalOpen.value = false;
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: err?.data?.message || err?.message || "No se pudo eliminar.",
      color: "error",
    });
  }
}

async function onCreate(event: FormSubmitEvent<BillingFormSchema>) {
  try {
    const input: BillingCreateForReservationInput = {
      date: event.data.date,
      amount: event.data.amount,
      observations: event.data.observations,
    };

    await create(input);
    toast.add({
      title: "Cobro agregado",
      description: "Se agregó correctamente.",
      color: "success",
    });

    billingState.date = undefined;
    billingState.amount = undefined;
    billingState.observations = undefined;
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: err?.data?.message || err?.message || "No se pudo agregar.",
      color: "error",
    });
  }
}

const UButton = resolveComponent("UButton");

const columns: TableColumn<BillingDto>[] = [
  {
    accessorKey: "date",
    header: "Fecha",
    cell: ({ row }: { row: { original: BillingDto } }) =>
      formatIsoDateTo(row.original.date),
  },
  {
    accessorKey: "amount",
    header: "Monto",
    meta: {
      class: {
        th: "text-right",
        td: "text-right font-medium",
      },
    },
    cell: ({ row }: { row: { original: BillingDto } }) =>
      formatMoney(row.original.amount),
  },
  {
    accessorKey: "observations",
    header: "Observaciones",
    cell: ({ row }: { row: { original: BillingDto } }) =>
      row.original.observations ?? "-",
  },
  {
    id: "actions",
    header: "Acciones",
    enableHiding: false,
    meta: {
      class: {
        th: "text-right",
        td: "text-right",
      },
    },
    cell: ({ row }: { row: { original: BillingDto } }) =>
      h(
        UButton as any,
        {
          size: "xs",
          color: "error",
          variant: "ghost",
          disabled: deleting.value,
          onClick: () => requestDelete(row.original),
        },
        () => "Eliminar"
      ),
  },
];
</script>

<template>
  <div class="space-y-6">
    <UForm
      :schema="billingCreateForReservationSchema"
      :state="billingState"
      class="space-y-4"
      @submit="onCreate"
    >
      <div class="grid gap-4 sm:grid-cols-3">
        <div>
          <UFormField label="Fecha" name="date" required>
            <AppDatePicker v-model="billingState.date" />
          </UFormField>
        </div>

        <div>
          <UFormField label="Monto" name="amount" required>
            <UInput
              v-model="billingState.amount"
              class="w-full"
              placeholder="0"
            />
          </UFormField>
        </div>

        <div class="sm:col-span-3">
          <UFormField label="Observaciones" name="observations">
            <UTextarea
              v-model="billingState.observations"
              class="w-full"
              placeholder="Observaciones"
            />
          </UFormField>
        </div>
      </div>

      <div class="flex items-center justify-end">
        <UButton type="submit" :loading="creating" :disabled="creating">
          Agregar cobro
        </UButton>
      </div>
    </UForm>

    <AppErrorMessage
      v-if="error"
      :error="error"
      show-retry
      @retry="refresh()"
    />

    <AppLoading v-if="pending" />

    <div
      v-if="status === 'success'"
      class="overflow-auto rounded-lg border border-default"
    >
      <UTable
        :data="billings"
        :columns="columns"
        :ui="{ tbody: '[&>tr:nth-child(odd)]:bg-elevated' }"
      >
        <template #empty>
          <div class="py-6 text-center text-sm text-muted">No hay cobros.</div>
        </template>
      </UTable>
    </div>

    <AppConfirmModal
      v-model="deleteModalOpen"
      title="Eliminar cobro"
      :description="deleteDescription"
      confirm-label="Eliminar"
      confirm-color="error"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>
