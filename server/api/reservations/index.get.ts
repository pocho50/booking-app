import type { ReservationListItemDto } from "../../../shared/types/reservation";
import { prisma } from "../../utils/db";
import { dateToIsoLocal } from "../../utils/date";
import { calculateReservationSaldo } from "../../utils/reservationSaldo";

export default defineEventHandler(async () => {
  const reservations = await prisma.reservation.findMany({
    where: { active: true },
    orderBy: { start_date: "desc" },
    include: {
      client: { select: { name: true, last_name: true } },
      resource: { select: { name: true } },
      billings: { select: { amount: true } },
    },
  });

  const dto: ReservationListItemDto[] = reservations.map((r) => {
    return {
      id: r.id,
      client: r.client ? `${r.client.name} ${r.client.last_name}`.trim() : "-",
      resource: r.resource?.name ?? "-",
      start_date: dateToIsoLocal(r.start_date),
      end_date: dateToIsoLocal(r.end_date),
      price: r.price,
      saldo: calculateReservationSaldo(r.price, r.billings),
      confirmed: r.confirmed,
    };
  });

  return dto;
});
