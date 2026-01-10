<script setup lang="ts">
import {
  createClient,
  type ClientCreateInput,
} from "../../services/clientService";

const saving = ref(false);
const toast = useToast();

async function onSubmit(data: ClientCreateInput) {
  try {
    saving.value = true;
    const created = await createClient(data);
    toast.add({
      title: "Cliente creado",
      description: "Se guardó correctamente.",
      color: "success",
    });
    await navigateTo(`/clientes/${created.id}`);
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
          <h1 class="text-2xl font-semibold">Agregar cliente</h1>
          <p class="text-sm text-muted">
            Completa los datos del cliente. Todos los campos son obligatorios.
          </p>
        </div>
        <UButton color="neutral" variant="outline" to="/clientes">
          Volver
        </UButton>
      </div>

      <UCard>
        <ClientForm
          :loading="saving"
          cancel-to="/clientes"
          submit-label="Guardar"
          @submit="onSubmit"
        />
      </UCard>
    </div>
  </section>
</template>
