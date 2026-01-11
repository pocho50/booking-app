export function formatIsoDateTo(value: string, locale = "es-ES") {
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) {
    return value;
  }

  const year = Number(y);
  const month = Number(m);
  const day = Number(d);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return value;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
