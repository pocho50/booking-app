<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { ResourceCreateInput } from "../../../shared/types/resource";
import {
  resourceCreateSchema,
  type ResourceCreateSchema,
} from "../../../shared/schemas/resource";

type Schema = ResourceCreateSchema;

type Props = {
  initialValues?: Partial<ResourceCreateInput>;
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
  submit: [data: ResourceCreateInput];
}>();

const state = reactive<Partial<Schema>>({
  name: undefined,
  description: undefined,
});

watch(
  () => props.initialValues,
  (values) => {
    state.name = values?.name;
    state.description = values?.description;
  },
  { immediate: true }
);

function onSubmit(event: FormSubmitEvent<Schema>) {
  emit("submit", event.data as ResourceCreateInput);
}
</script>

<template>
  <UForm
    :schema="resourceCreateSchema"
    :state="state"
    class="space-y-6"
    @submit="onSubmit"
  >
    <div class="grid gap-4">
      <div>
        <UFormField label="Nombre" name="name" required>
          <UInput v-model="state.name" class="w-full" placeholder="Casa 1" />
        </UFormField>
      </div>

      <div>
        <UFormField label="Descripción" name="description" required>
          <UTextarea
            v-model="state.description"
            class="w-full"
            placeholder="Descripción del recurso"
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
