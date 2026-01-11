<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import { listClients, type ClientDto } from "../../services/clientService";
import { useTableSearchPagination } from "../../composables/useTableSearchPagination";

const UButton = resolveComponent("UButton");

const {
  data: clientsData,
  pending,
  refresh,
  error,
} = await useAsyncData<ClientDto[]>("clients", () => listClients());

const clients = computed(() => clientsData.value ?? []);

const {
  search,
  pageSize,
  page,
  filteredItems: filteredClients,
  paginatedItems: paginatedClients,
  totalPages,
  pageSizeOptions,
} = useTableSearchPagination<ClientDto>({
  items: clients,
  searchFields: (c) => [c.name, c.last_name, c.doc, c.email, c.phone],
});

const columns: TableColumn<ClientDto>[] = [
  { accessorKey: "name", header: "Nombre" },
  { accessorKey: "last_name", header: "Apellido" },
  { accessorKey: "doc", header: "Doc" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phone", header: "Teléfono" },
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
    cell: ({ row }) =>
      h(
        UButton as any,
        {
          size: "sm",
          color: "neutral",
          variant: "outline",
          to: `/clientes/${row.original.id}`,
        },
        () => "Editar"
      ),
  },
];
</script>

<template>
  <section class="py-6">
    <div class="mb-4 flex items-center justify-between gap-3">
      <h1 class="text-xl font-semibold">Clientes</h1>

      <div class="flex items-center gap-2">
        <UButton color="neutral" variant="outline" @click="refresh()">
          Recargar
        </UButton>
        <UButton to="/clientes/nuevo" icon="i-lucide-user-plus">
          Agregar cliente
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
          placeholder="Buscar cliente..."
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
        <UTable :data="paginatedClients" :columns="columns">
          <template #empty>
            <div class="py-6 text-center text-sm text-muted">
              No hay clientes.
            </div>
          </template>
        </UTable>
      </div>

      <div
        class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="text-sm text-muted">
          {{ filteredClients.length }} resultado(s)
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
