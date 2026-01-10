<script setup lang="ts">
import {
  deleteResource,
  getResource,
  updateResource,
  type ResourceDto,
} from "../../services/resourceService";
import ResourceForm from "../../components/Resource/ResourceForm.vue";
import AppConfirmModal from "../../components/App/AppConfirmModal.vue";
import type { ResourceCreateInput } from "../../../shared/types/resource";

const route = useRoute();
const id = computed(() => String(route.params.id));

const {
  data: resource,
  pending,
  refresh,
  error,
} = await useAsyncData<ResourceDto>(
  () => `resource-${id.value}`,
  () => getResource(id.value)
);

const saving = ref(false);
const deleting = ref(false);
const toast = useToast();

const deleteModalOpen = ref(false);

const deleteDescription = computed(() => {
  if (!resource.value) {
    return undefined;
  }
  return `¿Eliminar el recurso ${resource.value.name}? Esta acción no se puede deshacer.`;
});

async function onSubmit(data: ResourceCreateInput) {
  try {
    saving.value = true;
    await updateResource(id.value, data);
    toast.add({
      title: "Cambios guardados",
      description: "El recurso se actualizó correctamente.",
      color: "success",
    });
    await refresh();
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: err?.data?.message || err?.message || "No se pudo guardar.",
      color: "error",
    });
  } finally {
    saving.value = false;
  }
}

function requestDelete() {
  if (!resource.value) {
    return;
  }
  deleteModalOpen.value = true;
}

async function confirmDelete() {
  if (!resource.value) {
    deleteModalOpen.value = false;
    return;
  }

  try {
    deleting.value = true;
    await deleteResource(id.value);
    toast.add({
      title: "Recurso eliminado",
      description: "Se eliminó correctamente.",
      color: "success",
    });
    await navigateTo("/recursos");
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
  <section class="py-8">
    <div class="mx-auto w-full max-w-4xl space-y-6">
      <div
        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 class="text-2xl font-semibold">Editar recurso</h1>
          <p class="text-sm text-muted">Actualiza los datos del recurso.</p>
        </div>

        <div class="flex items-center gap-2">
          <UButton color="neutral" variant="outline" to="/recursos">
            Volver
          </UButton>
          <UButton color="neutral" variant="outline" @click="refresh()">
            Recargar
          </UButton>
          <UButton
            color="error"
            variant="outline"
            :loading="deleting"
            :disabled="deleting"
            @click="requestDelete"
          >
            Eliminar
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

      <UCard v-else>
        <ResourceForm
          :initial-values="resource"
          :loading="saving"
          cancel-to="/recursos"
          submit-label="Guardar cambios"
          @submit="onSubmit"
        />
      </UCard>

      <AppConfirmModal
        v-model="deleteModalOpen"
        title="Eliminar recurso"
        :description="deleteDescription"
        confirm-label="Eliminar"
        confirm-color="error"
        :loading="deleting"
        @confirm="confirmDelete"
      />
    </div>
  </section>
</template>
