import type { ClientListItemDto } from "../../../shared/types/client";
import { prisma } from "../../utils/db";
import { calculateReservationSaldo } from "../../utils/reservationSaldo";

export default defineEventHandler(async () => {
  const clients = await prisma.client.findMany({
    orderBy: { last_name: "asc" },
    include: {
      reservations: {
        where: { active: true },
        select: {
          price: true,
          payments: { select: { amount: true } },
        },
      },
    },
  });

  const dto: ClientListItemDto[] = clients.map((c) => {
    const saldo = c.reservations.reduce((acc, r) => {
      return acc + calculateReservationSaldo(r.price, r.payments);
    }, 0);

    return {
      id: c.id,
      name: c.name,
      last_name: c.last_name,
      doc: c.doc,
      email: c.email,
      address: c.address,
      country: c.country,
      state: c.state,
      phone: c.phone,
      saldo,
    };
  });

  return dto;
});
