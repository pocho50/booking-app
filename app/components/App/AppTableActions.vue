<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import { computed } from "vue";

type Props = {
  items: DropdownMenuItem[] | DropdownMenuItem[][];
  disabled?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const normalizedItems = computed<DropdownMenuItem[][]>(() => {
  if (!props.items.length) {
    return [];
  }

  const first = props.items[0];

  if (Array.isArray(first)) {
    return props.items as DropdownMenuItem[][];
  }

  return [props.items as DropdownMenuItem[]];
});
</script>

<template>
  <UDropdownMenu
    :items="normalizedItems"
    :disabled="disabled"
    :ui="{ content: 'min-w-44' }"
  >
    <UButton
      icon="i-lucide-more-vertical"
      color="neutral"
      variant="ghost"
      size="xs"
      :disabled="disabled"
      class="cursor-pointer px-2"
    />
  </UDropdownMenu>
</template>
