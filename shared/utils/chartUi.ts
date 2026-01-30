import type { BulletLegendItemInterface } from "vue-chrts";

type SeriesItem = { key: string; name: string; color: string };

type SegmentItem = { key: string; name: string; color: string };

export function categoriesFromSeries(
  series: SeriesItem[] | undefined | null,
): Record<string, BulletLegendItemInterface> {
  if (!series?.length) return {};

  return series.reduce(
    (acc: Record<string, BulletLegendItemInterface>, item) => {
      acc[item.key] = {
        name: item.name,
        color: item.color,
      };
      return acc;
    },
    {} as Record<string, BulletLegendItemInterface>,
  );
}

export function categoriesFromSegments(
  segments: SegmentItem[] | undefined | null,
): Record<string, BulletLegendItemInterface> {
  if (!segments?.length) return {};

  return segments.reduce(
    (acc: Record<string, BulletLegendItemInterface>, item) => {
      acc[item.key] = {
        name: item.name,
        color: item.color,
      };
      return acc;
    },
    {} as Record<string, BulletLegendItemInterface>,
  );
}

export function formatChartValue(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "N/A";
  if (typeof value === "string") return value;

  if (Number.isInteger(value)) {
    return value.toLocaleString();
  }

  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
