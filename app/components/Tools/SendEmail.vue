<script setup lang="ts">
import type { SendEmailUIToolInvocation } from "~~/shared/utils/tools/sendEmailTool";
import { useToolStatusCard } from "~~/app/composables/useToolStatusCard";

const props = defineProps<{
  invocation: SendEmailUIToolInvocation;
}>();

const { color, icon, message, isStreaming } = useToolStatusCard({
  state: computed(() => props.invocation.state),
  icons: {
    "input-available": "i-lucide-mail",
    "output-available": "i-lucide-mail-check",
  },
  messages: {
    "input-available": "Enviando email...",
    "output-available": "Email enviado.",
  },
  defaultMessage: "Preparando envío...",
  defaultIcon: "i-lucide-loader-circle",
});
</script>

<template>
  <div v-if="invocation.state === 'output-available'" class="my-5">
    <div class="rounded-xl border border-default bg-elevated/40 p-4">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-mail-check"
              class="size-5 text-primary shrink-0"
            />
            <div class="min-w-0">
              <h3 class="text-base font-semibold text-highlighted truncate">
                {{ invocation.output.subject }}
              </h3>
              <p class="text-sm text-muted truncate">
                Para:
                {{
                  Array.isArray(invocation.output.to)
                    ? invocation.output.to.join(", ")
                    : ""
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <ToolsStatusCard
    v-else
    :color="color"
    :icon="icon"
    :message="message"
    :is-streaming="isStreaming"
    height-class="h-32"
  />
</template>
