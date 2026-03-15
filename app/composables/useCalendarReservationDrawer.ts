import type { CalendarResourceDto } from "../../shared/types/calendar";
import { useReservationEditorDrawer } from "./useReservationEditorDrawer";
import { usePaymentsDrawer } from "./usePaymentsDrawer";
import { useReservationDelete } from "./useReservationDelete";

export function useCalendarReservationDrawer(params: {
  resources: { value: CalendarResourceDto[] };
  refreshResources: () => Promise<unknown>;
}) {
  const editor = useReservationEditorDrawer(params);
  const payments = usePaymentsDrawer(params);
  const deletion = useReservationDelete({
    getEditingId: () => editor.editingId.value,
    closeDrawer: () => {
      editor.drawerOpen.value = false;
    },
    resetEditorState: editor.resetState,
    refreshResources: params.refreshResources,
  });

  // Close the payments drawer when opening the reservation editor.
  function onAvailableDayClick(
    ...args: Parameters<typeof editor.onAvailableDayClick>
  ) {
    payments.drawerOpen.value = false;
    editor.onAvailableDayClick(...args);
  }

  async function onReservationEdit(...args: Parameters<typeof editor.onEdit>) {
    payments.drawerOpen.value = false;
    await editor.onEdit(...args);
  }

  // Close the reservation drawer when opening the payments drawer.
  function onReservationPayments(...args: Parameters<typeof payments.onOpen>) {
    editor.drawerOpen.value = false;
    payments.onOpen(...args);
  }

  return {
    reservationDrawerOpen: editor.drawerOpen,
    selectedReservationResource: editor.selectedResource,
    selectedReservationIsoDate: editor.selectedIsoDate,
    editingReservationId: editor.editingId,
    reservationInitialValues: editor.initialValues,
    reservationLoading: editor.loading,
    paymentsDrawerOpen: payments.drawerOpen,
    paymentsReservationId: payments.reservationId,
    paymentsReservation: payments.reservation,
    deleteModalOpen: deletion.modalOpen,
    deleting: deletion.deleting,
    reservationDateLabel: editor.dateLabel,
    drawerTitle: editor.title,
    paymentsDrawerTitle: payments.title,
    onAvailableDayClick,
    onReservationEdit,
    onReservationPayments,
    onReservationSubmit: editor.onSubmit,
    onReservationCancel: editor.onCancel,
    onPaymentsDrawerClose: payments.onClose,
    openPaymentsById: payments.openById,
    syncEditingReservationSaldoFromCalendar: editor.syncSaldoFromCalendar,
    syncPaymentsReservationFromCalendar: payments.syncFromCalendar,
    confirmDeleteReservation: deletion.confirm,
  };
}
