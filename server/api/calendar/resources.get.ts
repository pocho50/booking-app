import { createError, getQuery } from "h3";
import { listCalendarResources } from "../../application/calendar/listCalendarResources";
import { PrismaCalendarRepository } from "../../infrastructure/prisma/PrismaCalendarRepository";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const month = Number(query.month);
  const year = Number(query.year);

  if (!Number.isFinite(month) || month < 1 || month > 12) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid month",
    });
  }

  if (!Number.isFinite(year) || year < 1970 || year > 2100) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid year",
    });
  }

  const repo = new PrismaCalendarRepository();
  return listCalendarResources(repo, { month, year });
});
