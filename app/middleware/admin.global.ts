export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith("/usuarios")) {
    return;
  }

  const { user } = useUserSession();

  if (user.value?.role !== "ADMIN") {
    return navigateTo("/");
  }
});
