export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event);

  if (
    pathname.startsWith("/api/") &&
    pathname !== "/api/auth/login" &&
    pathname !== "/api/auth/logout"
  ) {
    await requireUserSession(event);
  }
});
