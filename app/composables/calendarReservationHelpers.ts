import type {
  CalendarResourceDto,
  CalendarReservationDto,
} from "../../shared/types/calendar";

const pad = (n: number) => String(n).padStart(2, "0");

export function buildIsoDate({
  day,
  month,
  year,
}: {
  day: number;
  month: number;
  year: number;
}) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function findResourceById(
  resources: CalendarResourceDto[],
  resourceId: string | number,
): CalendarResourceDto | null {
  return (
    (resources || []).find(
      (r) => String(r.id) === String(resourceId),
    ) ?? null
  );
}

export function findCalendarReservationById(
  reservationId: string,
  resources: CalendarResourceDto[],
): CalendarReservationDto | undefined {
  return (resources || [])
    .flatMap((resource) => resource.reservations || [])
    .find((reservation) => reservation.id === reservationId);
}

export function mergeClientNames<
  T extends { clientFirstName?: string; clientLastName?: string },
>(
  base: T | null | undefined,
  override: T | null | undefined,
): T | null {
  if (!override) {
    return (base as T) ?? null;
  }

  return {
    ...base,
    ...override,
    clientFirstName: override.clientFirstName ?? base?.clientFirstName,
    clientLastName: override.clientLastName ?? base?.clientLastName,
  } as T;
}
