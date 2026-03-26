import type { H3Event } from "h3";

export async function requireAdmin(event: H3Event) {
  const session = await requireUserSession(event);

  if (session.user.role !== "ADMIN") {
    throw createError({
      statusCode: 403,
      statusMessage: "Acceso denegado. Se requiere rol de administrador.",
    });
  }

  return session;
}
