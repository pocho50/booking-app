<script setup lang="ts">
type Props = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "neutral";
  loading?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  description: undefined,
  confirmLabel: "Confirmar",
  cancelLabel: "Cancelar",
  confirmColor: "error",
  loading: false,
});

const open = defineModel<boolean>({ required: true });

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

function onCancel() {
  open.value = false;
  emit("cancel");
}

function onConfirm() {
  emit("confirm");
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="props.title"
    :description="props.description"
    :dismissible="!props.loading"
  >
    <template #footer>
      <div class="flex items-center justify-end gap-2">
        <UButton
          color="neutral"
          variant="outline"
          :disabled="props.loading"
          @click="onCancel"
        >
          {{ props.cancelLabel }}
        </UButton>
        <UButton
          :color="props.confirmColor"
          :loading="props.loading"
          :disabled="props.loading"
          @click="onConfirm"
        >
          {{ props.confirmLabel }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
