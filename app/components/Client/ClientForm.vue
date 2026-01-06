<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { ClientCreateInput } from "../../../shared/types/client";
import {
  clientCreateSchema,
  type ClientCreateSchema,
} from "../../../shared/schemas/client";

type Schema = ClientCreateSchema;

type Props = {
  initialValues?: Partial<ClientCreateInput>;
  submitLabel?: string;
  cancelTo?: string;
  loading?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  initialValues: undefined,
  submitLabel: "Guardar",
  cancelTo: undefined,
  loading: false,
});

const emit = defineEmits<{
  submit: [data: ClientCreateInput];
}>();

const state = reactive<Partial<Schema>>({
  name: undefined,
  last_name: undefined,
  doc: undefined,
  email: undefined,
  address: undefined,
  country: undefined,
  state: undefined,
  phone: undefined,
});

watch(
  () => props.initialValues,
  (values) => {
    state.name = values?.name;
    state.last_name = values?.last_name;
    state.doc = values?.doc;
    state.email = values?.email;
    state.address = values?.address;
    state.country = values?.country;
    state.state = values?.state;
    state.phone = values?.phone;
  },
  { immediate: true }
);

function onSubmit(event: FormSubmitEvent<Schema>) {
  emit("submit", event.data as ClientCreateInput);
}
</script>

<template>
  <UForm
    :schema="clientCreateSchema"
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
        <UFormField label="Apellido" name="last_name" required>
          <UInput
            v-model="state.last_name"
            class="w-full"
            placeholder="Pérez"
          />
        </UFormField>
      </div>

      <div class="sm:col-span-1">
        <UFormField label="Doc" name="doc" required>
          <UInput
            v-model="state.doc"
            class="w-full"
            placeholder="DNI / Pasaporte"
          />
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

      <div class="sm:col-span-2">
        <UFormField label="Dirección" name="address" required>
          <UInput
            v-model="state.address"
            class="w-full"
            placeholder="Calle 123"
          />
        </UFormField>
      </div>

      <div class="sm:col-span-1">
        <UFormField label="País" name="country" required>
          <UInput v-model="state.country" class="w-full" placeholder="España" />
        </UFormField>
      </div>

      <div class="sm:col-span-1">
        <UFormField label="Estado" name="state" required>
          <UInput v-model="state.state" class="w-full" placeholder="Madrid" />
        </UFormField>
      </div>

      <div class="sm:col-span-2">
        <UFormField label="Teléfono" name="phone" required>
          <UInput
            v-model="state.phone"
            class="w-full"
            placeholder="+34 600 000 000"
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
