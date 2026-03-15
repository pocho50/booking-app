type ErrorWithDataMessage = {
  data?: {
    statusMessage?: string;
    message?: string;
  };
  message?: string;
};

export function getErrorMessage(
  error: unknown,
  fallback = "Ocurrió un error.",
): string {
  if (typeof error !== "object" || error === null) {
    return fallback;
  }

  const parsedError = error as ErrorWithDataMessage;

  return (
    parsedError.data?.statusMessage ||
    parsedError.data?.message ||
    parsedError.message ||
    fallback
  );
}
