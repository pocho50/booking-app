import { deleteReservation } from "../../application/reservation/deleteReservation";
import { PrismaReservationRepository } from "../../infrastructure/prisma/PrismaReservationRepository";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "id is required" });
  }

  const repo = new PrismaReservationRepository();
  await deleteReservation(repo, id);

  setResponseStatus(event, 204);
  return null;
});
