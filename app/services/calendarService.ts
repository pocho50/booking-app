export async function listCalendarResources(params: {
  month: number;
  year: number;
}) {
  const { $api } = useNuxtApp();

  return $api<CalendarResourceDto[]>("/calendar/resources", {
    query: params,
  });
}
