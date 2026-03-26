<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import {
  userCreateSchema,
  type UserCreateSchema,
} from "~~/shared/schemas/user";

type Schema = UserCreateSchema;

type Props = {
  initialValues?: Partial<UserCreateInput>;
  submitLabel?: string;
  cancelTo?: string;
  loading?: boolean;
  isEdit?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  initialValues: undefined,
  submitLabel: "Guardar",
  cancelTo: undefined,
  loading: false,
  isEdit: false,
});

const emit = defineEmits<{
  submit: [data: UserCreateInput];
}>();

const roleOptions = [
  { label: "Usuario", value: "USER" },
  { label: "Administrador", value: "ADMIN" },
];

const state = reactive<Partial<Schema>>({
  name: undefined,
  email: undefined,
  password: undefined,
  role: undefined,
});

watch(
  () => props.initialValues,
  (values) => {
    state.name = values?.name;
    state.email = values?.email;
    state.password = undefined;
    state.role = values?.role;
  },
  { immediate: true },
);

function onSubmit(event: FormSubmitEvent<Schema>) {
  const data = { ...event.data } as UserCreateInput;
  if (props.isEdit && !data.password) {
    delete (data as Partial<UserCreateInput>).password;
  }
  emit("submit", data);
}
</script>

<template>
  <UForm
    :schema="userCreateSchema"
    :state="state"
    class="space-y-6"
    @submit="onSubmit"
  >
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="sm:col-span-1">
        <UFormField label="Nombre" name="name" required>
          <UInput v-model="state.name" class="w-full" placeholder="Juan" />
        </UFormField>
      </div>

      <div class="sm:col-span-1">
        <UFormField label="Email" name="email" required>
          <UInput
            v-model="state.email"
            class="w-full"
            type="email"
            placeholder="juan@mail.com"
          />
        </UFormField>
      </div>

      <div class="sm:col-span-1">
        <UFormField label="Contraseña" name="password" :required="!isEdit">
          <UInput
            v-model="state.password"
            class="w-full"
            type="password"
            :placeholder="isEdit ? 'Dejar vacío para no cambiar' : 'Contraseña'"
          />
        </UFormField>
      </div>

      <div class="sm:col-span-1">
        <UFormField label="Rol" name="role" required>
          <USelect
            v-model="state.role"
            :items="roleOptions"
            value-key="value"
            class="w-full"
            placeholder="Seleccionar rol"
          />
        </UFormField>
      </div>
    </div>

    <div
      class="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end"
    >
      <UButton v-if="cancelTo" color="neutral" variant="outline" :to="cancelTo">
        Cancelar
      </UButton>
      <UButton type="submit" :loading="loading" :disabled="loading">
        {{ submitLabel }}
      </UButton>
    </div>
  </UForm>
</template>
