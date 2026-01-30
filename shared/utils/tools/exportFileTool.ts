import { tool } from "ai";
import type { UIToolInvocation } from "ai";
import { z } from "zod";

export type ExportFileUIToolInvocation = UIToolInvocation<
  typeof exportFileTool
>;

export const exportFileTool = tool({
  description:
    "Generate a downloadable file (CSV) from provided headers and rows, and return a URL that the user can download.",
  inputSchema: z.object({
    title: z.string().optional().describe("Title shown in the chat"),
    filename: z
      .string()
      .optional()
      .describe(
        "Optional filename (e.g. clients.csv). If omitted, one is generated",
      ),
    headers: z
      .array(
        z.object({
          key: z
            .string()
            .describe("Column key used to read values from each row object"),
          label: z.string().describe("Column label used in the CSV header row"),
        }),
      )
      .min(1)
      .describe("CSV headers"),
    rows: z
      .array(
        z.record(
          z.string(),
          z.union([z.string(), z.number(), z.boolean(), z.null()]),
        ),
      )
      .describe("Rows to export"),
  }),
  execute: async ({ title, filename, headers, rows }) => {
    const { randomUUID } = await import("node:crypto");
    const { writeExport } = await import("~~/server/utils/exportStore");

    const escapeCsvValue = (value: unknown) => {
      if (value === null || value === undefined) return "";
      const s = String(value);
      const needsQuotes = /[\n\r\t,\"]/g.test(s);
      const escaped = s.replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    };

    const csvHeader = headers.map((h) => escapeCsvValue(h.label)).join(",");

    const csvRows = rows.map((row) => {
      return headers
        .map((h) => escapeCsvValue((row as Record<string, unknown>)[h.key]))
        .join(",");
    });

    const csv = [csvHeader, ...csvRows].join("\n") + "\n";

    const id = randomUUID();
    const safeFilename = (filename ?? `${id}.csv`).replace(/\s+/g, "_");

    await writeExport({
      id,
      filename: safeFilename,
      mimeType: "text/csv; charset=utf-8",
      content: csv,
    });

    return {
      title,
      url: `/api/exports/${id}`,
      filename: safeFilename,
      mimeType: "text/csv",
    };
  },
});
