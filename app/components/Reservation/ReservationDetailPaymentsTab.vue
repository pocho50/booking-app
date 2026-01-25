<script setup lang="ts">
import type { FormSubmitEvent, TableColumn } from "@nuxt/ui";
import { h, resolveComponent } from "vue";
import type {
  PaymentCreateForReservationInput,
  PaymentDto,
} from "../../../shared/types/payment";
import {
  paymentCreateForReservationSchema,
  type PaymentCreateSchema,
} from "../../../shared/schemas/payment";
import { formatIsoDateTo } from "../../../shared/utils/dateFormat";
import { formatMoney } from "../../../shared/utils/moneyFormat";

type Props = {
  reservationId: string;
};

const props = defineProps<Props>();

const emit = defineEmits<{
  paymentsUpdated: [];
  paymentsPendingChange: [pending: boolean];
}>();

const toast = useToast();

const reservationIdRef = computed(() => props.reservationId);

const {
  payments,
  pending,
  status,
  error,
  refresh,
  creating,
  deleting,
  create,
  remove,
} = useReservationPayments(reservationIdRef);

watch(
  pending,
  (value) => {
    emit("paymentsPendingChange", value);
  },
  { immediate: true },
);

type PaymentFormSchema = Omit<PaymentCreateSchema, "id_reservation">;

const paymentState = reactive<Partial<PaymentFormSchema>>({
  date: undefined,
  amount: undefined,
  observations: undefined,
});

const deleteModalOpen = ref(false);
const paymentToDelete = ref<PaymentDto | null>(null);

const deleteDescription = computed(() => {
  if (!paymentToDelete.value) {
    return undefined;
  }
  return "¿Eliminar el pago? Esta acción no se puede deshacer.";
});

function requestDelete(item: PaymentDto) {
  paymentToDelete.value = item;
  deleteModalOpen.value = true;
}

async function confirmDelete() {
  if (!paymentToDelete.value) {
    deleteModalOpen.value = false;
    return;
  }

  try {
    await remove(paymentToDelete.value.id);
    emit("paymentsUpdated");
    toast.add({
      title: "Pago eliminado",
      description: "Se eliminó correctamente.",
      color: "success",
    });
    paymentToDelete.value = null;
    deleteModalOpen.value = false;
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: err?.data?.message || err?.message || "No se pudo eliminar.",
      color: "error",
    });
  }
}

async function onCreate(event: FormSubmitEvent<PaymentFormSchema>) {
  try {
    const input: PaymentCreateForReservationInput = {
      date: event.data.date,
      amount: event.data.amount,
      observations: event.data.observations,
    };

    await create(input);
    emit("paymentsUpdated");
    toast.add({
      title: "Pago agregado",
      description: "Se agregó correctamente.",
      color: "success",
    });

    paymentState.date = undefined;
    paymentState.amount = undefined;
    paymentState.observations = undefined;
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: err?.data?.message || err?.message || "No se pudo agregar.",
      color: "error",
    });
  }
}

const UButton = resolveComponent("UButton");

const columns: TableColumn<PaymentDto>[] = [
  {
    accessorKey: "date",
    header: "Fecha",
    cell: ({ row }: { row: { original: PaymentDto } }) =>
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
    cell: ({ row }: { row: { original: PaymentDto } }) =>
      formatMoney(row.original.amount),
  },
  {
    accessorKey: "observations",
    header: "Observaciones",
    cell: ({ row }: { row: { original: PaymentDto } }) =>
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
    cell: ({ row }: { row: { original: PaymentDto } }) =>
      h(
        UButton as any,
        {
          size: "xs",
          color: "error",
          variant: "ghost",
          disabled: deleting.value,
          onClick: () => requestDelete(row.original),
        },
        () => "Eliminar",
      ),
  },
];
</script>

<template>
  <div class="space-y-6">
    <UForm
      :schema="paymentCreateForReservationSchema"
      :state="paymentState"
      class="space-y-4"
      @submit="onCreate"
    >
      <div class="grid gap-4 sm:grid-cols-3">
        <div>
          <UFormField label="Fecha" name="date" required>
            <AppDatePicker v-model="paymentState.date" />
          </UFormField>
        </div>

        <div>
          <UFormField label="Monto" name="amount" required>
            <UInput
              v-model="paymentState.amount"
              class="w-full"
              placeholder="0"
            />
          </UFormField>
        </div>

        <div class="sm:col-span-3">
          <UFormField label="Observaciones" name="observations">
            <UTextarea
              v-model="paymentState.observations"
              class="w-full"
              placeholder="Observaciones"
            />
          </UFormField>
        </div>
      </div>

      <div class="flex items-center justify-end">
        <UButton type="submit" :loading="creating" :disabled="creating">
          Agregar pago
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
        :data="payments"
        :columns="columns"
        :ui="{ tbody: '[&>tr:nth-child(odd)]:bg-elevated' }"
      >
        <template #empty>
          <div class="py-6 text-center text-sm text-muted">No hay pagos.</div>
        </template>
      </UTable>
    </div>

    <AppConfirmModal
      v-model="deleteModalOpen"
      title="Eliminar pago"
      :description="deleteDescription"
      confirm-label="Eliminar"
      confirm-color="error"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>
