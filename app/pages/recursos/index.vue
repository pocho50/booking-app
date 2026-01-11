<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";
import {
  deleteResource,
  listResources,
  type ResourceDto,
} from "../../services/resourceService";
import { useTableSearchPagination } from "../../composables/useTableSearchPagination";

const UButton = resolveComponent("UButton");

const {
  data: resourcesData,
  pending,
  refresh,
  error,
} = await useAsyncData<ResourceDto[]>("resources", () => listResources());

const resources = computed(() => resourcesData.value ?? []);

const {
  search,
  pageSize,
  page,
  filteredItems: filteredResources,
  paginatedItems: paginatedResources,
  totalPages,
  pageSizeOptions,
} = useTableSearchPagination<ResourceDto>({
  items: resources,
  searchFields: (r) => [r.name, r.description],
});

const toast = useToast();

const deleteModalOpen = ref(false);
const resourceToDelete = ref<ResourceDto | null>(null);
const deleting = ref(false);

const deleteDescription = computed(() => {
  if (!resourceToDelete.value) {
    return undefined;
  }
  return `¿Eliminar el recurso ${resourceToDelete.value.name}? Esta acción no se puede deshacer.`;
});

function requestDelete(resource: ResourceDto) {
  resourceToDelete.value = resource;
  deleteModalOpen.value = true;
}

const columns: TableColumn<ResourceDto>[] = [
  { accessorKey: "name", header: "Nombre" },
  { accessorKey: "description", header: "Descripción" },
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
      h("div", { class: "flex justify-end gap-2" }, [
        h(
          UButton as any,
          {
            size: "sm",
            color: "neutral",
            variant: "outline",
            to: `/recursos/${row.original.id}`,
          },
          () => "Editar"
        ),
        h(
          UButton as any,
          {
            size: "sm",
            color: "error",
            variant: "outline",
            onClick: () => requestDelete(row.original),
          },
          () => "Eliminar"
        ),
      ]),
  },
];

async function confirmDelete() {
  if (!resourceToDelete.value) {
    deleteModalOpen.value = false;
    return;
  }

  try {
    deleting.value = true;
    await deleteResource(resourceToDelete.value.id);
    toast.add({
      title: "Recurso eliminado",
      description: "Se eliminó correctamente.",
      color: "success",
    });
    await refresh();
    deleteModalOpen.value = false;
    resourceToDelete.value = null;
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: err?.data?.message || err?.message || "No se pudo eliminar.",
      color: "error",
    });
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <section class="py-6">
    <div class="mb-4 flex items-center justify-between gap-3">
      <h1 class="text-xl font-semibold">Recursos</h1>

      <div class="flex items-center gap-2">
        <UButton color="neutral" variant="outline" @click="refresh()">
          Recargar
        </UButton>
        <UButton to="/recursos/nuevo" icon="i-lucide-plus">
          Agregar recurso
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
          placeholder="Buscar recurso..."
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
        <UTable :data="paginatedResources" :columns="columns">
          <template #empty>
            <div class="py-6 text-center text-sm text-muted">
              No hay recursos.
            </div>
          </template>
        </UTable>
      </div>

      <div
        class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="text-sm text-muted">
          {{ filteredResources.length }} resultado(s)
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

    <AppConfirmModal
      v-model="deleteModalOpen"
      title="Eliminar recurso"
      :description="deleteDescription"
      confirm-label="Eliminar"
      confirm-color="error"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="resourceToDelete = null"
    />
  </section>
</template>
