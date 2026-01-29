<script setup lang="ts">
import type { DonutChartUIToolInvocation } from "~~/shared/utils/tools/chartDonutTool";
import type { BulletLegendItemInterface } from "vue-chrts";
import { DonutType, LegendPosition } from "vue-chrts";

const props = defineProps<{
  invocation: DonutChartUIToolInvocation;
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
      "input-available": "i-lucide-pie-chart",
      "output-error": "i-lucide-triangle-alert",
    }[props.invocation.state as string] || "i-lucide-loader-circle"
  );
});

const message = computed(() => {
  return (
    {
      "input-available": "Generating chart...",
      "output-error": "Can't generate chart, please try again",
    }[props.invocation.state as string] || "Loading chart data..."
  );
});

const categories = (
  invocation: DonutChartUIToolInvocation,
): Record<string, BulletLegendItemInterface> => {
  if (!invocation.output?.segments) return {};

  return invocation.output.segments.reduce(
    (
      acc: Record<string, BulletLegendItemInterface>,
      segment: { key: string; name: string; color: string },
    ) => {
      acc[segment.key] = {
        name: segment.name,
        color: segment.color,
      };
      return acc;
    },
    {} as Record<string, BulletLegendItemInterface>,
  );
};

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

const formatValue = (value: number | undefined): string => {
  if (value === undefined || value === null) return "N/A";

  if (Number.isInteger(value)) {
    return value.toLocaleString();
  }
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};
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
        :categories="categories(invocation)"
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
                {{ formatValue(values?.[values.label]) }}
              </span>
            </div>
          </div>
        </template>
      </DonutChart>
    </div>
  </div>

  <div v-else class="rounded-xl px-5 py-4 my-5" :class="color">
    <div class="flex items-center justify-center h-44">
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

<style>
:root {
  --vis-tooltip-padding: 0 !important;
  --vis-tooltip-background-color: transparent !important;
  --vis-tooltip-border-color: transparent !important;

  --vis-axis-grid-color: rgba(255, 255, 255, 0) !important;
  --vis-axis-tick-label-color: var(--ui-text-muted) !important;
  --vis-axis-label-color: var(--ui-text-toned) !important;
  --vis-legend-label-color: var(--ui-text-muted) !important;

  --dot-pattern-color: #111827;
}

.dark {
  --dot-pattern-color: #9ca3af;
}

.dot-pattern {
  position: absolute;
  background-image: radial-gradient(
    var(--dot-pattern-color) 1px,
    transparent 1px
  );
  background-size: 7px 7px;
  background-position: -8.5px -8.5px;
  opacity: 20%;
  mask-image: radial-gradient(
    ellipse at center,
    rgba(0, 0, 0, 1),
    transparent 75%
  );
}
</style>
