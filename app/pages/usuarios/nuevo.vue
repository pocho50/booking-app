<script setup lang="ts">
import {
  createUser,
  type UserCreateInput,
} from "../../services/userService";

const saving = ref(false);
const toast = useToast();
const { showError } = useErrorToast();

async function onSubmit(data: UserCreateInput) {
  try {
    saving.value = true;
    const created = await createUser(data);
    toast.add({
      title: "Usuario creado",
      description: "Se guardó correctamente.",
      color: "success",
    });
    await navigateTo(`/usuarios/${created.id}`);
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
          <h1 class="text-2xl font-semibold">Agregar usuario</h1>
          <p class="text-sm text-muted">
            Completa los datos del nuevo usuario de sistema.
          </p>
        </div>
        <UButton color="neutral" variant="outline" to="/usuarios">
          Volver
        </UButton>
      </div>

      <UCard>
        <UserForm
          :loading="saving"
          cancel-to="/usuarios"
          submit-label="Guardar"
          @submit="onSubmit"
        />
      </UCard>
    </div>
  </section>
</template>
