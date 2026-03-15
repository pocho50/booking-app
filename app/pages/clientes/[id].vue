<script setup lang="ts">
import {
  getClient,
  updateClient,
  type ClientDto,
} from "../../services/clientService";

const route = useRoute();
const id = computed(() => String(route.params.id));

const {
  data: client,
  pending,
  refresh,
  error,
} = await useAsyncData<ClientDto>(
  () => `client-${id.value}`,
  () => getClient(id.value),
);

const saving = ref(false);
const toast = useToast();
const { showError } = useErrorToast();

async function onSubmit(data: ClientCreateInput) {
  try {
    saving.value = true;
    await updateClient(id.value, data);
    toast.add({
      title: "Cambios guardados",
      description: "El cliente se actualizó correctamente.",
      color: "success",
    });
    await refresh();
  } catch (error: unknown) {
    showError(error, "No se pudo guardar.");
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
          <h1 class="text-2xl font-semibold">Editar cliente</h1>
          <p class="text-sm text-muted">Actualiza los datos del cliente.</p>
        </div>

        <div class="flex items-center gap-2">
          <UButton color="neutral" variant="outline" to="/clientes">
            Volver
          </UButton>
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

      <UCard v-else>
        <ClientForm
          :initial-values="client"
          :loading="saving"
          cancel-to="/clientes"
          submit-label="Guardar cambios"
          @submit="onSubmit"
        />
      </UCard>
    </div>
  </section>
</template>
