import type { CalendarRepository } from "../../domain/calendar/CalendarRepository";
import type { CalendarResourceDto } from "../../../shared/types/calendar";
import { prisma } from "../../utils/db";
import { dateToIsoLocal } from "../../utils/date";
import { calculateReservationSaldo } from "../../utils/reservationSaldo";

export class PrismaCalendarRepository implements CalendarRepository {
  async listResourcesWithReservations(params: {
    month: number;
    year: number;
  }): Promise<CalendarResourceDto[]> {
    const monthStart = new Date(params.year, params.month - 1, 1, 0, 0, 0);
    const monthEnd = new Date(params.year, params.month, 0, 23, 59, 59);

    const resources = await prisma.resource.findMany({
      orderBy: { name: "asc" },
      include: {
        reservations: {
          where: {
            start_date: { lte: monthEnd },
            end_date: { gte: monthStart },
          },
          orderBy: { start_date: "asc" },
          include: {
            client: {
              select: {
                name: true,
                last_name: true,
              },
            },
            billings: { select: { amount: true } },
          },
        },
      },
    });

    return resources.map((r) => ({
      id: r.id,
      name: r.name,
      reservations: (r.reservations || []).map((res) => ({
        id: res.id,
        startDate: dateToIsoLocal(res.start_date),
        endDate: dateToIsoLocal(res.end_date),
        confirmed: res.confirmed ? 1 : 0,
        active: res.active ? 1 : 0,
        price: res.price,
        saldo: calculateReservationSaldo(res.price, res.billings),
        clientFirstName: res.client?.name,
        clientLastName: res.client?.last_name,
      })),
    }));
  }
}
