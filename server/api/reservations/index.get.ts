import { listReservations } from "../../application/reservation/listReservations";
import { PrismaReservationRepository } from "../../infrastructure/prisma/PrismaReservationRepository";

export default defineEventHandler(async () => {
  const repo = new PrismaReservationRepository();
  return listReservations(repo);
});
