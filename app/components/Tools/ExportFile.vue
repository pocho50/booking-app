<script setup lang="ts">
import type { ExportFileUIToolInvocation } from "~~/shared/utils/tools/exportFileTool";

const props = defineProps<{
  invocation: ExportFileUIToolInvocation;
}>();

const color = computed(() => {
  return (
    {
      "output-error": "bg-muted text-error",
    }[props.invocation.state as string] || "bg-muted text-white"
  );
});

const icon = computed(() => {
  return (
    {
      "input-available": "i-lucide-file-down",
      "output-error": "i-lucide-triangle-alert",
    }[props.invocation.state as string] || "i-lucide-loader-circle"
  );
});

const message = computed(() => {
  return (
    {
      "input-available": "Generating export...",
      "output-error": "Can't generate export, please try again",
    }[props.invocation.state as string] || "Preparing file..."
  );
});

const downloadUrl = computed(() => props.invocation.output?.url ?? "");
</script>

<template>
  <div v-if="invocation.state === 'output-available'" class="my-5">
    <div class="rounded-xl border border-default bg-elevated/40 p-4">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-file-down" class="size-5 text-primary shrink-0" />
            <div class="min-w-0">
              <h3 class="text-base font-semibold text-highlighted truncate">
                {{ invocation.output.title ?? invocation.output.filename }}
              </h3>
              <p class="text-sm text-muted truncate">
                {{ invocation.output.filename }}
              </p>
            </div>
          </div>
        </div>

        <UButton
          color="primary"
          :to="downloadUrl"
          target="_blank"
          icon="i-lucide-download"
          :disabled="!downloadUrl"
        >
          Descargar
        </UButton>
      </div>
    </div>
  </div>

  <div v-else class="rounded-xl px-5 py-4 my-5" :class="color">
    <div class="flex items-center justify-center h-32">
      <div class="text-center">
        <UIcon
          :name="icon"
          class="size-8 mx-auto mb-2"
          :class="[invocation.state === 'input-streaming' && 'animate-spin']"
        />
        <div class="text-sm">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>
