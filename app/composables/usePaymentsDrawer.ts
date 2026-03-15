import type {
  CalendarResourceDto,
  CalendarReservationDto,
} from "../../shared/types/calendar";
import {
  findCalendarReservationById,
  mergeClientNames,
} from "./calendarReservationHelpers";

type ReservationPaymentsPayload = {
  reservationId: string | null;
  reservation: CalendarReservationDto;
};

export function usePaymentsDrawer(params: {
  resources: { value: CalendarResourceDto[] };
}) {
  const drawerOpen = ref(false);
  const reservationId = ref<string | null>(null);
  const reservation = ref<CalendarReservationDto | null>(null);

  const title = computed(() => {
    const current = reservation.value;
    if (!current) {
      return "Pagos";
    }

    const name = `${current.clientFirstName || ""} ${
      current.clientLastName || ""
    }`.trim();

    return name ? `Pagos • ${name}` : "Pagos";
  });

  function onOpen(payload: ReservationPaymentsPayload) {
    if (!payload.reservationId) {
      return;
    }

    reservationId.value = payload.reservationId;
    reservation.value = payload.reservation;
    drawerOpen.value = true;
  }

  function onClose() {
    drawerOpen.value = false;
    reservationId.value = null;
    reservation.value = null;
  }

  // Open payments drawer by id, enriching passed data with latest calendar data.
  function openById(
    id: string,
    calendarReservation?: CalendarReservationDto | null,
  ) {
    const fallback = findCalendarReservationById(id, params.resources.value);
    reservation.value = mergeClientNames(fallback, calendarReservation);
    reservationId.value = id;
    drawerOpen.value = true;
  }

  // Keep payment drawer reservation data synchronized after calendar refreshes.
  function syncFromCalendar(resources: CalendarResourceDto[]) {
    if (!reservationId.value) {
      return;
    }

    const found = findCalendarReservationById(reservationId.value, resources);
    if (!found) {
      return;
    }

    reservation.value = mergeClientNames(reservation.value, found);
  }

  return {
    drawerOpen,
    reservationId,
    reservation,
    title,
    onOpen,
    onClose,
    openById,
    syncFromCalendar,
  };
}
