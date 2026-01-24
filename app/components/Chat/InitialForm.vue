<script setup lang="ts">
type Props = {
  placeholder?: string;
  submitText?: string;
};

const props = withDefaults(defineProps<Props>(), {
  placeholder: "¿En qué puedo ayudarte?",
  submitText: "Iniciar",
});

const emit = defineEmits<{
  (e: "submit", event: Event): void;
}>();

const modelValue = defineModel<string>({ default: "" });
</script>

<template>
  <div class="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4">
    <form
      class="flex w-full max-w-2xl flex-col gap-4"
      @submit="emit('submit', $event)"
    >
      <div class="text-center">
        <h1 class="text-2xl font-semibold">Consulta tus datos</h1>
        <p class="mt-1 text-sm text-muted">
          Pide reportes o métricas de la aplicación para comenzar.
        </p>
      </div>
      <div
        class="flex items-center gap-2 rounded-2xl border border-default bg-background px-4 py-3 shadow-sm"
      >
        <UInput
          v-model="modelValue"
          :placeholder="props.placeholder"
          size="xl"
          variant="none"
          class="flex-1"
        />
        <UButton
          type="submit"
          color="primary"
          size="lg"
          icon="i-lucide-arrow-up"
          :aria-label="props.submitText"
        />
      </div>
      <p class="text-center text-xs text-muted">
        Ejemplo: “Resumen de reservas de este mes”.
      </p>
    </form>
  </div>
</template>
