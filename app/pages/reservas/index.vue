<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { DropdownMenuItem, TableColumn } from "@nuxt/ui";
import { listReservations } from "../../services/reservationService";

import { useTableSearchPagination } from "../../composables/useTableSearchPagination";

const UBadge = resolveComponent("UBadge");

const {
  data: reservationsData,
  pending,
  refresh,
  error,
} = await useAsyncData<ReservationListItemDto[]>("reservations", () =>
  listReservations(),
);

const reservations = computed<ReservationListItemDto[]>(() =>
  [...(reservationsData.value ?? [])].sort((a, b) =>
    b.start_date.localeCompare(a.start_date),
  ),
);

const {
  search,
  pageSize,
  page,
  filteredItems: filteredReservations,
  paginatedItems: paginatedReservations,
  totalPages,
  pageSizeOptions,
} = useTableSearchPagination<ReservationListItemDto>({
  items: reservations,
  searchFields: (r) => [
    r.client,
    r.resource,
    r.start_date,
    r.end_date,
    r.price,
    r.saldo,
  ],
});

const columns: TableColumn<ReservationListItemDto>[] = [
  { accessorKey: "client", header: "Cliente" },
  { accessorKey: "resource", header: "Recurso" },
  {
    accessorKey: "start_date",
    header: "Fecha inicio",
    cell: ({ row }) => formatIsoDateTo(row.original.start_date),
  },
  {
    accessorKey: "end_date",
    header: "Fecha fin",
    cell: ({ row }) => formatIsoDateTo(row.original.end_date),
  },
  {
    accessorKey: "price",
    header: "Precio",
    meta: {
      class: {
        th: "text-right",
        td: "text-right font-medium",
      },
    },
    cell: ({ row }) => formatMoney(row.original.price),
  },
  {
    accessorKey: "saldo",
    header: "Saldo",
    meta: {
      class: {
        th: "text-right",
        td: "text-right",
      },
    },
    cell: ({ row }) =>
      h(
        UBadge as any,
        {
          size: "md",
          variant: "subtle",
          color: row.original.saldo <= 0 ? "success" : "error",
        },
        () => formatMoney(row.original.saldo),
      ),
  },
  {
    accessorKey: "confirmed",
    header: "Confirmado",
    meta: {
      class: {
        th: "text-center",
        td: "text-center",
      },
    },
    cell: ({ row }) => {
      const confirmed = row.original.confirmed;
      return h(
        UBadge as any,
        {
          size: "md",
          variant: "subtle",
          color: confirmed ? "success" : "warning",
        },
        () => (confirmed ? "Sí" : "No"),
      );
    },
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
    cell: ({ row }) => {
      const items: DropdownMenuItem[] = [
        {
          label: "Detalles",
          icon: "i-lucide-eye",
          to: `/reservas/${row.original.id}`,
        },
      ];

      return h(resolveComponent("AppTableActions") as any, { items });
    },
  },
];
</script>

<template>
  <section class="py-6">
    <div class="mb-4 flex items-center justify-between gap-3">
      <h1 class="text-xl font-semibold">Reservas</h1>

      <div class="flex items-center gap-2">
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

    <div v-else class="space-y-3">
      <div
        class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <UInput
          v-model="search"
          class="w-full sm:max-w-md"
          placeholder="Buscar reserva..."
        />

        <div class="flex items-center gap-2">
          <span class="text-sm text-muted">Filas:</span>
          <USelect
            v-model="pageSize"
            :items="pageSizeOptions"
            value-key="value"
            size="sm"
            class="w-28"
          />
        </div>
      </div>

      <div class="overflow-auto rounded-lg border border-default">
        <UTable
          :data="paginatedReservations"
          :columns="columns"
          :ui="{ tbody: '[&>tr:nth-child(odd)]:bg-elevated' }"
        >
          <template #empty>
            <div class="py-6 text-center text-sm text-muted">
              No hay reservas.
            </div>
          </template>
        </UTable>
      </div>

      <div
        class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="text-sm text-muted">
          {{ filteredReservations.length }} resultado(s)
        </div>

        <div class="flex items-center justify-end gap-2">
          <UButton
            size="sm"
            color="neutral"
            variant="outline"
            :disabled="page <= 1"
            @click="page -= 1"
          >
            Anterior
          </UButton>
          <div class="text-sm text-muted">
            Página {{ page }} de {{ totalPages }}
          </div>
          <UButton
            size="sm"
            color="neutral"
            variant="outline"
            :disabled="page >= totalPages"
            @click="page += 1"
          >
            Siguiente
          </UButton>
        </div>
      </div>
    </div>
  </section>
</template>
