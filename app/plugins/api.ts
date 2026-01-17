export default defineNuxtPlugin(() => {
  const headers = useRequestHeaders(["cookie"]);

  const api = $fetch.create({
    baseURL: "/api",
    headers,
  });

  return {
    provide: {
      api,
    },
  };
});
