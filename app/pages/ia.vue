<script setup lang="ts">
import { Chat } from "@ai-sdk/vue";
import type { UIMessage } from "ai";
import type { ChartUIToolInvocation } from "~~/shared/utils/tools/chartLineTool";

const messages: UIMessage[] = [];
const input = ref("");
const chat = new Chat({ messages });

const hasStarted = ref(false);

const onSubmit = (e: Event) => {
  e.preventDefault();
  hasStarted.value = true;
  chat.sendMessage({ text: input.value });
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
        </template>
      </template>
    </UChatMessages>

    <div class="sticky bottom-5 p-4 sm:pb-6">
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
