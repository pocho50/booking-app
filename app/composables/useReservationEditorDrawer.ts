import {
  createReservation,
  getReservation,
  updateReservation,
} from "../services/reservationService";
import {
  buildIsoDate,
  findCalendarReservationById,
  findResourceById,
} from "./calendarReservationHelpers";

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

type ReservationFormInput = {
  clientId: string | null;
  start_date: string;
  end_date: string;
  observation?: string;
  price: number;
  confirmed: boolean;
  active: boolean;
};

export function useReservationEditorDrawer(params: {
  resources: { value: CalendarResourceDto[] };
  refreshResources: () => Promise<unknown>;
}) {
  const drawerOpen = ref(false);
  const selectedResource = ref<CalendarResourceDto | null>(null);
  const selectedIsoDate = ref<string | null>(null);

  const editingId = ref<string | null>(null);
  const initialValues = ref<ReservationDto | null>(null);
  const loading = ref(false);

  const toast = useToast();
  const { showError } = useErrorToast();

  const dateLabel = computed(() => {
    if (!selectedIsoDate.value) {
      return undefined;
    }
    return formatIsoDateTo(selectedIsoDate.value);
  });

  const title = computed(() =>
    editingId.value ? "Editar reserva" : "Nueva reserva",
  );

  function resetState() {
    editingId.value = null;
    initialValues.value = null;
  }

  function onAvailableDayClick(payload: AvailableDayClickPayload) {
    selectedResource.value = findResourceById(
      params.resources.value,
      payload.resourceId,
    );

    resetState();

    selectedIsoDate.value = buildIsoDate(payload);
    drawerOpen.value = true;
  }

  async function onEdit(payload: ReservationEditPayload) {
    if (!payload.reservationId) {
      return;
    }

    selectedResource.value = findResourceById(
      params.resources.value,
      payload.resourceId,
    );

    editingId.value = payload.reservationId;
    drawerOpen.value = true;
    loading.value = true;

    try {
      const reservation = await getReservation(payload.reservationId);
      initialValues.value = reservation;
      selectedIsoDate.value = reservation.start_date;
    } finally {
      loading.value = false;
    }
  }

  async function onSubmit(data: ReservationFormInput) {
    if (!selectedResource.value) {
      return;
    }

    try {
      const payload: ReservationCreateInput = {
        start_date: data.start_date,
        end_date: data.end_date,
        id_resource: String(selectedResource.value.id),
        id_client: data.active ? data.clientId : null,
        observation: data.observation,
        price: data.price,
        confirmed: data.confirmed,
        active: data.active,
      };

      if (editingId.value) {
        const updatePayload: ReservationUpdateInput = payload;
        await updateReservation(editingId.value, updatePayload);
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

      drawerOpen.value = false;
      resetState();

      await params.refreshResources();
    } catch (error: unknown) {
      showError(error, "No se pudo guardar.");
    }
  }

  function onCancel() {
    drawerOpen.value = false;
    resetState();
  }

  // Keep edit form saldo synced with the latest calendar reservation snapshot.
  function syncSaldoFromCalendar(resources: CalendarResourceDto[]) {
    if (!editingId.value || !initialValues.value) {
      return;
    }

    const reservation = findCalendarReservationById(editingId.value, resources);

    if (reservation && typeof reservation.saldo === "number") {
      initialValues.value = {
        ...initialValues.value,
        saldo: reservation.saldo,
      };
    }
  }

  return {
    drawerOpen,
    selectedResource,
    selectedIsoDate,
    editingId,
    initialValues,
    loading,
    dateLabel,
    title,
    resetState,
    onAvailableDayClick,
    onEdit,
    onSubmit,
    onCancel,
    syncSaldoFromCalendar,
  };
}
