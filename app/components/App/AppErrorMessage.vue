<script setup lang="ts">
import type { ButtonProps } from "@nuxt/ui";

const props = withDefaults(
  defineProps<{
    error?: unknown;
    title?: string;
    fallbackMessage?: string;
    showRetry?: boolean;
    retryLabel?: string;
  }>(),
  {
    error: undefined,
    title: "Error",
    fallbackMessage: "Ocurrió un error inesperado.",
    showRetry: false,
    retryLabel: "Reintentar",
  },
);

const emit = defineEmits<{
  retry: [];
}>();

const description = computed(() => {
  const err: any = props.error;

  return (
    err?.data?.message ||
    err?.statusMessage ||
    err?.message ||
    err?.toString?.() ||
    props.fallbackMessage
  );
});

const actions = computed<ButtonProps[] | undefined>(() => {
  if (!props.showRetry) {
    return undefined;
  }

  return [
    {
      label: props.retryLabel,
      color: "neutral" as const,
      variant: "outline" as const,
      onClick: () => emit("retry"),
    },
  ];
});
</script>

<template>
  <UAlert
    color="error"
    variant="subtle"
    icon="i-lucide-triangle-alert"
    :title="title"
    :description="description"
    :actions="actions"
  />
</template>
