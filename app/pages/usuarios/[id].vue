<script setup lang="ts">
import {
  deleteUser,
  getUser,
  updateUser,
  type UserDto,
} from "../../services/userService";

const route = useRoute();
const id = computed(() => String(route.params.id));

const {
  data: user,
  pending,
  refresh,
  error,
} = await useAsyncData<UserDto>(
  () => `user-${id.value}`,
  () => getUser(id.value),
);

const saving = ref(false);
const deleting = ref(false);
const toast = useToast();
const { showError } = useErrorToast();

const deleteModalOpen = ref(false);

const deleteDescription = computed(() => {
  if (!user.value) {
    return undefined;
  }
  return `¿Eliminar el usuario ${user.value.name}? Esta acción no se puede deshacer.`;
});

async function onSubmit(data: UserCreateInput) {
  try {
    saving.value = true;
    await updateUser(id.value, data);
    toast.add({
      title: "Cambios guardados",
      description: "El usuario se actualizó correctamente.",
      color: "success",
    });
    await refresh();
  } catch (error: unknown) {
    showError(error, "No se pudo guardar.");
  } finally {
    saving.value = false;
  }
}

function requestDelete() {
  if (!user.value) {
    return;
  }
  deleteModalOpen.value = true;
}

async function confirmDelete() {
  if (!user.value) {
    deleteModalOpen.value = false;
    return;
  }

  try {
    deleting.value = true;
    await deleteUser(id.value);
    toast.add({
      title: "Usuario eliminado",
      description: "Se eliminó correctamente.",
      color: "success",
    });
    await navigateTo("/usuarios");
  } catch (error: unknown) {
    showError(error, "No se pudo eliminar.");
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
          <h1 class="text-2xl font-semibold">Editar usuario</h1>
          <p class="text-sm text-muted">Actualiza los datos del usuario.</p>
        </div>

        <div class="flex items-center gap-2">
          <UButton color="neutral" variant="outline" to="/usuarios">
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
        <UserForm
          :initial-values="user"
          :loading="saving"
          :is-edit="true"
          cancel-to="/usuarios"
          submit-label="Guardar cambios"
          @submit="onSubmit"
        />
      </UCard>

      <AppConfirmModal
        v-model="deleteModalOpen"
        title="Eliminar usuario"
        :description="deleteDescription"
        confirm-label="Eliminar"
        confirm-color="error"
        :loading="deleting"
        @confirm="confirmDelete"
      />
    </div>
  </section>
</template>
