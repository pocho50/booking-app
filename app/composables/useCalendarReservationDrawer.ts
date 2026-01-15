import { computed, ref } from "vue";
import type {
  CalendarResourceDto,
  CalendarReservationDto,
} from "../../shared/types/calendar";
import type {
  ReservationCreateInput,
  ReservationDto,
  ReservationUpdateInput,
} from "../../shared/types/reservation";
import { formatIsoDateTo } from "../../shared/utils/dateFormat";
import {
  createReservation,
  deleteReservation,
  getReservation,
  updateReservation,
} from "../services/reservationService";

type AvailableDayClickPayload = {
  resourceId: string | number;
  day: number;
  month: number;
  year: number;
};

type ReservationEditPayload = {
  reservationId: string | null;
  resourceId: string;
};

type ReservationBillingsPayload = {
  reservationId: string | null;
  reservation: CalendarReservationDto;
};

const pad = (n: number) => String(n).padStart(2, "0");

export function useCalendarReservationDrawer(params: {
  resources: { value: CalendarResourceDto[] };
  refreshResources: () => Promise<unknown>;
}) {
  const reservationDrawerOpen = ref(false);
  const selectedReservationResource = ref<CalendarResourceDto | null>(null);
  const selectedReservationIsoDate = ref<string | null>(null);

  const editingReservationId = ref<string | null>(null);
  const reservationInitialValues = ref<ReservationDto | null>(null);
  const reservationLoading = ref(false);

  const billingsDrawerOpen = ref(false);
  const billingsReservationId = ref<string | null>(null);
  const billingsReservation = ref<CalendarReservationDto | null>(null);

  const deleteModalOpen = ref(false);
  const deleting = ref(false);

  const toast = useToast();

  const reservationDateLabel = computed(() => {
    if (!selectedReservationIsoDate.value) {
      return undefined;
    }
    return formatIsoDateTo(selectedReservationIsoDate.value);
  });

  const drawerTitle = computed(() =>
    editingReservationId.value ? "Editar reserva" : "Nueva reserva"
  );

  const billingsDrawerTitle = computed(() => {
    const current = billingsReservation.value;
    if (!current) {
      return "Cobros";
    }

    const name = `${current.clientFirstName || ""} ${
      current.clientLastName || ""
    }`
      .trim()
      .replace(/^\s+|\s+$/g, "");

    return name ? `Cobros • ${name}` : "Cobros";
  });

  function parseIsoFromCalendarClick({
    day,
    month,
    year,
  }: AvailableDayClickPayload) {
    return `${year}-${pad(month)}-${pad(day)}`;
  }

  function onAvailableDayClick(payload: AvailableDayClickPayload) {
    const found = (params.resources.value || []).find(
      (r) => String(r.id) === String(payload.resourceId)
    );
    selectedReservationResource.value = found ?? null;

    editingReservationId.value = null;
    reservationInitialValues.value = null;
    billingsDrawerOpen.value = false;

    selectedReservationIsoDate.value = parseIsoFromCalendarClick(payload);
    reservationDrawerOpen.value = true;
  }

  async function onReservationEdit(payload: ReservationEditPayload) {
    if (!payload.reservationId) {
      return;
    }

    const found = (params.resources.value || []).find(
      (r) => String(r.id) === String(payload.resourceId)
    );
    selectedReservationResource.value = found ?? null;

    editingReservationId.value = payload.reservationId;
    billingsDrawerOpen.value = false;
    reservationDrawerOpen.value = true;
    reservationLoading.value = true;

    try {
      const reservation = await getReservation(payload.reservationId);
      reservationInitialValues.value = reservation;
      selectedReservationIsoDate.value = reservation.start_date;
    } finally {
      reservationLoading.value = false;
    }
  }

  async function onReservationSubmit(data: {
    clientId: string | null;
    start_date: string;
    end_date: string;
    observation?: string;
    price: number;
    confirmed: boolean;
    active: boolean;
  }) {
    if (!selectedReservationResource.value) {
      return;
    }

    try {
      const payload: ReservationCreateInput = {
        start_date: data.start_date,
        end_date: data.end_date,
        id_resource: String(selectedReservationResource.value.id),
        id_client: data.active ? data.clientId : null,
        observation: data.observation,
        price: data.price,
        confirmed: data.confirmed,
        active: data.active,
      };

      if (editingReservationId.value) {
        const updatePayload: ReservationUpdateInput = payload;
        await updateReservation(editingReservationId.value, updatePayload);
      } else {
        await createReservation(payload);
      }

      toast.add({
        title: "Reserva",
        description: data.active
          ? `Guardada • ${data.start_date} → ${data.end_date}`
          : `Bloqueo guardado • ${data.start_date} → ${data.end_date}`,
        color: "success",
      });

      reservationDrawerOpen.value = false;
      editingReservationId.value = null;
      reservationInitialValues.value = null;

      await params.refreshResources();
    } catch (err: any) {
      toast.add({
        title: "Error",
        description:
          err?.data?.message || err?.message || "No se pudo guardar.",
        color: "error",
      });
    }
  }

  function onReservationCancel() {
    reservationDrawerOpen.value = false;
    editingReservationId.value = null;
    reservationInitialValues.value = null;
  }

  function onReservationBillings(payload: ReservationBillingsPayload) {
    if (!payload.reservationId) {
      return;
    }

    billingsReservationId.value = payload.reservationId;
    billingsReservation.value = payload.reservation;
    reservationDrawerOpen.value = false;
    billingsDrawerOpen.value = true;
  }

  function onBillingsDrawerClose() {
    billingsDrawerOpen.value = false;
    billingsReservationId.value = null;
    billingsReservation.value = null;
  }

  function openBillingsById(reservationId: string) {
    billingsReservationId.value = reservationId;
    billingsReservation.value = null;
    billingsDrawerOpen.value = true;
  }

  async function confirmDeleteReservation() {
    if (!editingReservationId.value) {
      deleteModalOpen.value = false;
      return;
    }

    try {
      deleting.value = true;
      await deleteReservation(editingReservationId.value);

      toast.add({
        title: "Reserva",
        description: "Eliminada correctamente.",
        color: "success",
      });

      deleteModalOpen.value = false;
      reservationDrawerOpen.value = false;
      editingReservationId.value = null;
      reservationInitialValues.value = null;

      await params.refreshResources();
    } catch (err: any) {
      toast.add({
        title: "Error",
        description:
          err?.data?.message || err?.message || "No se pudo eliminar.",
        color: "error",
      });
    } finally {
      deleting.value = false;
    }
  }

  return {
    reservationDrawerOpen,
    selectedReservationResource,
    selectedReservationIsoDate,
    editingReservationId,
    reservationInitialValues,
    reservationLoading,
    billingsDrawerOpen,
    billingsReservationId,
    billingsReservation,
    deleteModalOpen,
    deleting,
    reservationDateLabel,
    drawerTitle,
    billingsDrawerTitle,
    onAvailableDayClick,
    onReservationEdit,
    onReservationBillings,
    onReservationSubmit,
    onReservationCancel,
    onBillingsDrawerClose,
    openBillingsById,
    confirmDeleteReservation,
  };
}
