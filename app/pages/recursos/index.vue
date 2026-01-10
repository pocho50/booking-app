<script setup lang="ts">
import {
  deleteResource,
  listResources,
  type ResourceDto,
} from "../../services/resourceService";
import AppConfirmModal from "../../components/App/AppConfirmModal.vue";

const {
  data: resourcesData,
  pending,
  refresh,
  error,
} = await useAsyncData<ResourceDto[]>("resources", () => listResources());

const resources = computed(() => resourcesData.value ?? []);

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

    <div v-else class="overflow-auto rounded-lg border border-default">
      <table class="w-full border-collapse text-sm">
        <thead class="bg-elevated/60">
          <tr>
            <th class="border border-default px-3 py-2 text-left">Nombre</th>
            <th class="border border-default px-3 py-2 text-left">
              Descripción
            </th>
            <th class="border border-default px-3 py-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in resources" :key="r.id">
            <td class="border border-default px-3 py-2">{{ r.name }}</td>
            <td class="border border-default px-3 py-2">{{ r.description }}</td>
            <td class="border border-default px-3 py-2 text-right">
              <div class="flex justify-end gap-2">
                <UButton
                  size="sm"
                  color="neutral"
                  variant="outline"
                  :to="`/recursos/${r.id}`"
                >
                  Editar
                </UButton>
                <UButton
                  size="sm"
                  color="error"
                  variant="outline"
                  @click="requestDelete(r)"
                >
                  Eliminar
                </UButton>
              </div>
            </td>
          </tr>

          <tr v-if="resources.length === 0">
            <td class="border border-default px-3 py-6 text-center" colspan="3">
              No hay recursos.
            </td>
          </tr>
        </tbody>
      </table>
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
