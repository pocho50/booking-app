import { tool } from "ai";
import type { UIToolInvocation } from "ai";
import { z } from "zod";

export type BarChartUIToolInvocation = UIToolInvocation<typeof chartBarTool>;

export const chartBarTool = tool({
  description:
    "Create a bar chart visualization with one or multiple data series. Use this tool to display categorical comparisons, grouped bars, or stacked bars.",
  inputSchema: z.object({
    title: z.string().optional().describe("Title of the chart"),
    data: z
      .array(z.record(z.string(), z.union([z.string(), z.number()])))
      .min(1)
      .describe(
        "REQUIRED: Array of data points (minimum 1 point). Each object must contain the xKey property and all series keys",
      ),
    xKey: z
      .string()
      .describe(
        'The property name in data objects to use for x-axis values (e.g., "category", "month")',
      ),
    series: z
      .array(
        z.object({
          key: z
            .string()
            .describe(
              "The property name in data objects for this series (must exist in all data points)",
            ),
          name: z.string().describe("Display name for this series in the legend"),
          color: z
            .string()
            .describe(
              'Hex color code for this bar series (e.g., "#3b82f6" for blue, "#10b981" for green)',
            ),
        }),
      )
      .min(1)
      .describe(
        "Array of series configurations (minimum 1 series). Each series represents one bar group/stack",
      ),
    stacked: z
      .boolean()
      .optional()
      .describe("Optional: if true, create a stacked bar chart"),
    xLabel: z.string().optional().describe("Optional label for x-axis"),
    yLabel: z.string().optional().describe("Optional label for y-axis"),
  }),
  execute: async ({ title, data, xKey, series, stacked, xLabel, yLabel }) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return {
      title,
      data,
      xKey,
      series,
      stacked,
      xLabel,
      yLabel,
    };
  },
});
