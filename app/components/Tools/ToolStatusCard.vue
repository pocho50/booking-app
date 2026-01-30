<script setup lang="ts">
type Props = {
  color: string;
  icon: string;
  message: string;
  isStreaming?: boolean;
  heightClass?: string;
};

const props = withDefaults(defineProps<Props>(), {
  isStreaming: false,
  heightClass: "h-44",
});
</script>

<template>
  <div class="rounded-xl px-5 py-4 my-5" :class="props.color">
    <div class="flex items-center justify-center" :class="props.heightClass">
      <div class="text-center">
        <UIcon
          :name="props.icon"
          class="size-8 mx-auto mb-2"
          :class="[props.isStreaming && 'animate-spin']"
        />
        <div class="text-sm">
          {{ props.message }}
        </div>
      </div>
    </div>
  </div>
</template>
