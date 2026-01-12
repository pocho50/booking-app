<script setup lang="ts">
import type { DateValue } from "@internationalized/date";
import { parseDate } from "@internationalized/date";
import { formatIsoDateTo } from "../../../shared/utils/dateFormat";

type Props = {
  placeholder?: string;
  disabled?: boolean;
  minIso?: string;
  locale?: string;
};

const props = withDefaults(defineProps<Props>(), {
  placeholder: "dd/mm/aaaa",
  disabled: false,
  minIso: undefined,
  locale: "es-ES",
});

const model = defineModel<string | undefined>({ required: true });

const open = ref(false);

function isoToDateValue(value?: string): DateValue | null {
  if (!value) {
    return null;
  }
  try {
    return parseDate(value);
  } catch {
    return null;
  }
}

function dateValueToIso(
  value: DateValue | null | undefined
): string | undefined {
  if (!value) {
    return undefined;
  }
  return value.toString();
}

const dateValueModel = computed<DateValue | null>({
  get: () => isoToDateValue(model.value),
  set: (value) => {
    model.value = dateValueToIso(value);
  },
});

const minDateValue = computed<DateValue | undefined>(() => {
  if (!props.minIso) {
    return undefined;
  }
  try {
    return parseDate(props.minIso);
  } catch {
    return undefined;
  }
});

function isDateDisabled(date: DateValue) {
  if (!minDateValue.value) {
    return false;
  }
  return date.compare(minDateValue.value) < 0;
}

const displayValue = computed(() => {
  if (!model.value) {
    return "";
  }
  return formatIsoDateTo(model.value, props.locale);
});

function onSelect(value: DateValue | null) {
  dateValueModel.value = value;
  if (value) {
    open.value = false;
  }
}
</script>

<template>
  <UPopover
    v-model:open="open"
    :dismissible="true"
    :content="{ side: 'bottom', align: 'start', sideOffset: 8 }"
  >
    <UButton
      color="neutral"
      variant="outline"
      class="w-full justify-between"
      :disabled="props.disabled"
      icon="i-lucide-calendar"
    >
      <span :class="displayValue ? '' : 'text-dimmed'">
        {{ displayValue || props.placeholder }}
      </span>
    </UButton>

    <template #content>
      <div class="p-2">
        <UCalendar
          :model-value="dateValueModel"
          :min-value="minDateValue"
          :is-date-disabled="isDateDisabled"
          @update:model-value="onSelect"
        />
      </div>
    </template>
  </UPopover>
</template>
