<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label?: string;
  }>(),
  {
    label: "Cargando...",
  }
);
</script>

<template>
  <div class="flex items-center gap-2 text-sm text-muted">
    <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin" />
    <span>{{ props.label }}</span>
  </div>
</template>
