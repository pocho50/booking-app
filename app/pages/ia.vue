<script setup lang="ts">
import { Chat } from "@ai-sdk/vue";
import type { UIMessage } from "ai";
import type { ChartUIToolInvocation } from "~~/shared/utils/tools/chartLineTool";
import type { BarChartUIToolInvocation } from "~~/shared/utils/tools/chartBarTool";
import type { DonutChartUIToolInvocation } from "~~/shared/utils/tools/chartDonutTool";
import type { ExportFileUIToolInvocation } from "~~/shared/utils/tools/exportFileTool";
import type { SendEmailUIToolInvocation } from "~~/shared/utils/tools/sendEmailTool";

const messages: UIMessage[] = [];
const input = ref("");
const chat = new Chat({ messages });

const hasStarted = ref(false);

const onSubmit = (e: Event) => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  hasStarted.value = true;
  chat.sendMessage({ text });
  input.value = "";
};
</script>

<template>
  <ChatInitialForm v-if="!hasStarted" v-model="input" @submit="onSubmit" />
  <div
    v-else
    class="flex h-[calc(100svh-var(--ui-header-height))] flex-col overflow-hidden pt-5"
  >
    <UChatMessages
      :messages="chat.messages"
      :status="chat.status"
      :ui="{
        indicator:
          'h-6 flex items-center gap-1 py-3 *:size-2 *:rounded-full *:bg-gray-400 dark:*:bg-gray-500 [&>*:nth-child(1)]:animate-[bounce_1s_infinite] [&>*:nth-child(2)]:animate-[bounce_1s_0.15s_infinite] [&>*:nth-child(3)]:animate-[bounce_1s_0.3s_infinite]',
      }"
      class="flex-1 min-h-0 overflow-y-auto pb-6"
      :should-auto-scroll="true"
    >
      <template #content="{ message }">
        <template
          v-for="(part, index) in message.parts"
          :key="`${message.id}-${part.type}-${index}${'state' in part ? `-${part.state}` : ''}`"
        >
          <MDC
            v-if="part.type === 'text' && message.role === 'assistant'"
            :value="part.text"
            :cache-key="`${message.id}-${index}`"
            class="*:first:mt-0 *:last:mb-0"
          />
          <p
            v-else-if="part.type === 'text' && message.role === 'user'"
            class="whitespace-pre-wrap"
          >
            {{ part.text }}
          </p>

          <ToolsChartLine
            v-else-if="part.type === 'tool-chartLineTool'"
            :invocation="part as ChartUIToolInvocation"
          />

          <ToolsChartBar
            v-else-if="part.type === 'tool-chartBarTool'"
            :invocation="part as BarChartUIToolInvocation"
          />

          <ToolsChartDonut
            v-else-if="part.type === 'tool-chartDonutTool'"
            :invocation="part as DonutChartUIToolInvocation"
          />

          <ToolsExportFile
            v-else-if="part.type === 'tool-exportFileTool'"
            :invocation="part as ExportFileUIToolInvocation"
          />

          <ToolsSendEmail
            v-else-if="part.type === 'tool-sendEmailTool'"
            :invocation="part as SendEmailUIToolInvocation"
          />
        </template>
      </template>
    </UChatMessages>

    <div class="sticky bottom-5 p-4 sm:pb-6">
      {{ chat.status }}
      <UChatPrompt
        v-model="input"
        placeholder="Escribe tu mensaje"
        :error="chat.error"
        @submit="onSubmit"
      >
        <UChatPromptSubmit
          :status="chat.status"
          @stop="chat.stop()"
          @reload="chat.regenerate()"
        />
      </UChatPrompt>
    </div>
  </div>
</template>
