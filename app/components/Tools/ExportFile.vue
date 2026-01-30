<script setup lang="ts">
import type { ExportFileUIToolInvocation } from "~~/shared/utils/tools/exportFileTool";

const props = defineProps<{
  invocation: ExportFileUIToolInvocation;
}>();

const { color, icon, message, isStreaming } = useToolStatusCard({
  state: computed(() => props.invocation.state as string),
  icons: {
    "input-available": "i-lucide-file-down",
  },
  messages: {
    "input-available": "Generando archivo...",
  },
  defaultMessage: "Preparando archivo...",
});

const downloadUrl = computed(() => props.invocation.output?.url ?? "");
</script>

<template>
  <div v-if="invocation.state === 'output-available'" class="my-5">
    <div class="rounded-xl border border-default bg-elevated/40 p-4">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-file-down"
              class="size-5 text-primary shrink-0"
            />
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

  <ToolsToolStatusCard
    v-else
    :color="color"
    :icon="icon"
    :message="message"
    :is-streaming="isStreaming"
    height-class="h-32"
  />
</template>
