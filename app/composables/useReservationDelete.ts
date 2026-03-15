import { deleteReservation } from "../services/reservationService";

export function useReservationDelete(params: {
  getEditingId: () => string | null;
  closeDrawer: () => void;
  resetEditorState: () => void;
  refreshResources: () => Promise<unknown>;
}) {
  const modalOpen = ref(false);
  const deleting = ref(false);

  const toast = useToast();
  const { showError } = useErrorToast();

  async function confirm() {
    const editingId = params.getEditingId();
    if (!editingId) {
      modalOpen.value = false;
      return;
    }

    try {
      deleting.value = true;
      await deleteReservation(editingId);

      toast.add({
        title: "Reserva",
        description: "Eliminada correctamente.",
        color: "success",
      });

      modalOpen.value = false;
      params.closeDrawer();
      params.resetEditorState();

      await params.refreshResources();
    } catch (error: unknown) {
      showError(error, "No se pudo eliminar.");
    } finally {
      deleting.value = false;
    }
  }

  return {
    modalOpen,
    deleting,
    confirm,
  };
}
