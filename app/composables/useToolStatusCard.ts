import { computed, unref, type ComputedRef, type Ref } from "vue";

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>;

type ToolStatusCardOptions<State extends string> = {
  state: MaybeRef<State>;
  icons?: Partial<Record<State, string>>;
  messages?: Partial<Record<State, string>>;
  defaultIcon?: string;
  defaultMessage?: string;
  errorState?: State;
  streamingState?: State;
  idleColorClass?: string;
  errorColorClass?: string;
};

export function useToolStatusCard<State extends string>(
  options: ToolStatusCardOptions<State>,
) {
  const errorState = options.errorState ?? ("output-error" as State);
  const streamingState = options.streamingState ?? ("input-streaming" as State);

  const mergedIcons: Partial<Record<State, string>> = {
    [errorState]: "i-lucide-triangle-alert",
    ...(options.icons ?? {}),
  };

  const mergedMessages: Partial<Record<State, string>> = {
    [errorState]: "No se pudo completar la operación, intenta nuevamente.",
    ...(options.messages ?? {}),
  };

  const idleColorClass =
    options.idleColorClass ?? "bg-muted text-highlighted dark:text-white";
  const errorColorClass = options.errorColorClass ?? "bg-muted text-error";

  const defaultIcon = options.defaultIcon ?? "i-lucide-loader-circle";
  const defaultMessage = options.defaultMessage ?? "Cargando...";

  const state = computed<State>(() => unref(options.state) as State);

  const color = computed(() => {
    return state.value === errorState ? errorColorClass : idleColorClass;
  });

  const icon = computed(() => {
    return mergedIcons[state.value] ?? defaultIcon;
  });

  const message = computed(() => {
    return mergedMessages[state.value] ?? defaultMessage;
  });

  const isStreaming = computed(() => state.value === streamingState);

  return {
    color,
    icon,
    message,
    isStreaming,
  };
}
