<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { DropdownMenuItem, TableColumn } from "@nuxt/ui";
import {
  listUsers,
  type UserDto,
} from "../../services/userService";

import { useTableSearchPagination } from "../../composables/useTableSearchPagination";

const UBadge = resolveComponent("UBadge");

const {
  data: usersData,
  pending,
  refresh,
  error,
} = await useAsyncData<UserDto[]>("users", () => listUsers());

const users = computed(() => usersData.value ?? []);

const {
  search,
  pageSize,
  page,
  filteredItems: filteredUsers,
  paginatedItems: paginatedUsers,
  totalPages,
  pageSizeOptions,
} = useTableSearchPagination<UserDto>({
  items: users,
  searchFields: (u) => [u.name, u.email, u.role],
});

const columns: TableColumn<UserDto>[] = [
  { accessorKey: "name", header: "Nombre" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ row }) =>
      h(
        UBadge as any,
        {
          size: "md",
          variant: "subtle",
          color: row.original.role === "ADMIN" ? "primary" : "neutral",
        },
        () => (row.original.role === "ADMIN" ? "Administrador" : "Usuario"),
      ),
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
          label: "Editar",
          icon: "i-lucide-pencil",
          to: `/usuarios/${row.original.id}`,
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
      <h1 class="text-xl font-semibold">Usuarios</h1>

      <div class="flex items-center gap-2">
        <UButton color="neutral" variant="outline" @click="refresh()">
          Recargar
        </UButton>
        <UButton to="/usuarios/nuevo" icon="i-lucide-user-plus">
          Agregar usuario
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
          placeholder="Buscar usuario..."
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
          :data="paginatedUsers"
          :columns="columns"
          :ui="{ tbody: '[&>tr:nth-child(odd)]:bg-elevated' }"
        >
          <template #empty>
            <div class="py-6 text-center text-sm text-muted">
              No hay usuarios.
            </div>
          </template>
        </UTable>
      </div>

      <div
        class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="text-sm text-muted">
          {{ filteredUsers.length }} resultado(s)
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
