export function useErrorToast() {
  const toast = useToast();

  function showError(
    error: unknown,
    fallback = "No se pudo completar la acción.",
  ) {
    toast.add({
      title: "Error",
      description: getErrorMessage(error, fallback),
      color: "error",
    });
  }

  return {
    showError,
  };
}
