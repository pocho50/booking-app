export default defineEventHandler(async (event) => {
  const path = event.path || "";

  if (!path.startsWith("/api")) {
    return;
  }

  if (path === "/api/auth/login") {
    return;
  }

  await requireUserSession(event);
});
