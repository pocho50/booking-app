<script setup lang="ts">
import type { DonutChartUIToolInvocation } from "~~/shared/utils/tools/chartDonutTool";
import { DonutType, LegendPosition } from "vue-chrts";
import {
  categoriesFromSegments,
  formatChartValue,
} from "~~/shared/utils/chartUi";

const props = defineProps<{
  invocation: DonutChartUIToolInvocation;
}>();

const { color, icon, message, isStreaming } = useToolStatusCard({
  state: computed(() => props.invocation.state as string),
  icons: {
    "input-available": "i-lucide-pie-chart",
  },
  messages: {
    "input-available": "Generando gráfico...",
  },
  defaultMessage: "Cargando datos del gráfico...",
});

const data = (invocation: DonutChartUIToolInvocation): number[] => {
  if (!invocation.output?.segments) return [];
  return invocation.output.segments.map((s) => s.value);
};

const donutType = computed(() => {
  const type = props.invocation.output?.type;
  if (type === "half") return DonutType.Half;
  if (type === "full") return DonutType.Full;
  return undefined;
});
</script>

<template>
  <div v-if="invocation.state === 'output-available'" class="my-5">
    <div v-if="invocation.output.title" class="flex items-center gap-2 mb-2">
      <UIcon name="i-lucide-pie-chart" class="size-5 text-primary shrink-0" />
      <div class="min-w-0">
        <h3 class="text-lg font-semibold truncate">
          {{ invocation.output.title }}
        </h3>
      </div>
    </div>

    <div class="relative overflow-hidden">
      <div class="dot-pattern h-full -top-5 left-0 right-0" />

      <DonutChart
        :data="data(invocation)"
        :categories="categoriesFromSegments(invocation.output.segments)"
        :radius="invocation.output.radius ?? 80"
        :arc-width="invocation.output.arcWidth ?? 20"
        :height="invocation.output.height ?? 280"
        :pad-angle="invocation.output.padAngle ?? 0"
        :type="donutType"
        :legend-position="LegendPosition.BottomCenter"
        :hide-legend="false"
        :hide-tooltip="false"
      >
        <template #tooltip="{ values }">
          <div
            class="bg-muted/50 rounded-sm px-2 py-1 shadow-lg backdrop-blur-sm max-w-xs ring ring-offset-2 ring-offset-bg ring-default border border-default"
          >
            <div
              v-if="values?.label"
              class="text-sm font-semibold text-highlighted mb-2"
            >
              {{ values.label }}
            </div>
            <div
              v-if="values?.label"
              class="flex items-center justify-between gap-3"
            >
              <span class="text-sm text-muted truncate">{{
                values.label
              }}</span>
              <span class="text-sm font-semibold text-highlighted shrink-0">
                {{ formatChartValue(values?.[values.label]) }}
              </span>
            </div>
          </div>
        </template>
      </DonutChart>
    </div>
  </div>

  <ToolsToolStatusCard
    v-else
    :color="color"
    :icon="icon"
    :message="message"
    :is-streaming="isStreaming"
  />
</template>
