<script setup lang="ts">
import type { BarChartUIToolInvocation } from "~~/shared/utils/tools/chartBarTool";
import { LegendPosition } from "vue-chrts";
import {
  categoriesFromSeries,
  formatChartValue,
} from "~~/shared/utils/chartUi";

const props = defineProps<{
  invocation: BarChartUIToolInvocation;
}>();

const { color, icon, message, isStreaming } = useToolStatusCard({
  state: computed(() => props.invocation.state as string),
  icons: {
    "input-available": "i-lucide-bar-chart-3",
  },
  messages: {
    "input-available": "Generando gráfico...",
  },
  defaultMessage: "Cargando datos del gráfico...",
});

const xFormatter = (invocation: BarChartUIToolInvocation) => {
  return (tick: number, _i?: number, _ticks?: number[]): string => {
    if (!invocation.output?.data[tick]) return "";
    return String(invocation.output.data[tick][invocation.output.xKey] ?? "");
  };
};

const yAxis = (invocation: BarChartUIToolInvocation) => {
  if (!invocation.output?.series) return [];
  return invocation.output.series.map((s) => s.key);
};
</script>

<template>
  <div v-if="invocation.state === 'output-available'" class="my-5">
    <div v-if="invocation.output.title" class="flex items-center gap-2 mb-2">
      <UIcon name="i-lucide-bar-chart-3" class="size-5 text-primary shrink-0" />
      <div class="min-w-0">
        <h3 class="text-lg font-semibold truncate">
          {{ invocation.output.title }}
        </h3>
      </div>
    </div>

    <div class="relative overflow-hidden">
      <div class="dot-pattern h-full -top-5 left-0 right-0" />

      <BarChart
        :height="300"
        :data="invocation.output.data"
        :categories="categoriesFromSeries(invocation.output.series)"
        :x-formatter="xFormatter(invocation)"
        :x-label="invocation.output.xLabel"
        :y-label="invocation.output.yLabel"
        :y-grid-line="true"
        :legend-position="LegendPosition.TopCenter"
        :hide-legend="false"
        :hide-tooltip="false"
        :x-num-ticks="Math.min(6, invocation.output.data.length)"
        :y-num-ticks="5"
        :stacked="invocation.output.stacked"
        :x-axis="invocation.output.xKey"
        :y-axis="yAxis(invocation)"
      >
        <template #tooltip="{ values }">
          <div
            class="bg-muted/50 rounded-sm px-2 py-1 shadow-lg backdrop-blur-sm max-w-xs ring ring-offset-2 ring-offset-bg ring-default border border-default"
          >
            <div
              v-if="
                values && invocation.output && values[invocation.output.xKey]
              "
              class="text-sm font-semibold text-highlighted mb-2"
            >
              {{ values[invocation.output.xKey] }}
            </div>
            <div class="space-y-1.5">
              <div
                v-for="serie in invocation.output.series"
                :key="serie.key"
                class="flex items-center justify-between gap-3"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <div
                    class="size-2.5 rounded-full shrink-0"
                    :style="{ backgroundColor: serie.color }"
                  />
                  <span class="text-sm text-muted truncate">{{
                    serie.name
                  }}</span>
                </div>
                <span class="text-sm font-semibold text-highlighted shrink-0">
                  {{ formatChartValue(values?.[serie.key]) }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </BarChart>
    </div>
  </div>

  <ToolsStatusCard
    v-else
    :color="color"
    :icon="icon"
    :message="message"
    :is-streaming="isStreaming"
  />
</template>
