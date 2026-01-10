<script setup lang="ts">
import {
  createResource,
  type ResourceCreateInput,
} from "../../services/resourceService";
import ResourceForm from "../../components/Resource/ResourceForm.vue";

const saving = ref(false);
const toast = useToast();

async function onSubmit(data: ResourceCreateInput) {
  try {
    saving.value = true;
    const created = await createResource(data);
    toast.add({
      title: "Recurso creado",
      description: "Se guardó correctamente.",
      color: "success",
    });
    await navigateTo(`/recursos/${created.id}`);
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
</script>

<template>
  <section class="py-8">
    <div class="mx-auto w-full max-w-4xl space-y-6">
      <div
        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 class="text-2xl font-semibold">Agregar recurso</h1>
          <p class="text-sm text-muted">Completa los datos del recurso.</p>
        </div>
        <UButton color="neutral" variant="outline" to="/recursos">
          Volver
        </UButton>
      </div>

      <UCard>
        <ResourceForm
          :loading="saving"
          cancel-to="/recursos"
          submit-label="Guardar"
          @submit="onSubmit"
        />
      </UCard>
    </div>
  </section>
</template>
