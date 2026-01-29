import { tool } from "ai";
import type { UIToolInvocation } from "ai";
import { z } from "zod";

export type DonutChartUIToolInvocation = UIToolInvocation<typeof chartDonutTool>;

export const chartDonutTool = tool({
  description:
    "Create a donut chart visualization to show proportions/parts of a whole. Use this tool to display categorical distribution (e.g., breakdown of reservations by status).",
  inputSchema: z.object({
    title: z.string().optional().describe("Title of the chart"),
    segments: z
      .array(
        z.object({
          key: z.string().describe("Unique key for the segment"),
          name: z.string().describe("Display name for the segment"),
          value: z.number().describe("Numeric value for this segment"),
          color: z
            .string()
            .describe(
              'Hex color code for this segment (e.g., "#3b82f6" for blue, "#10b981" for green)',
            ),
        }),
      )
      .min(1)
      .describe("Array of segments (minimum 1)"),
    type: z
      .enum(["full", "half"])
      .optional()
      .describe("Optional donut type: full or half"),
    radius: z
      .number()
      .optional()
      .describe("Optional radius of the donut in pixels"),
    arcWidth: z
      .number()
      .optional()
      .describe("Optional arc width of the donut in pixels"),
    height: z.number().optional().describe("Optional height of the chart in pixels"),
    padAngle: z
      .number()
      .optional()
      .describe("Optional padding angle between segments"),
  }),
  execute: async ({ title, segments, type, radius, arcWidth, height, padAngle }) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return {
      title,
      segments,
      type,
      radius,
      arcWidth,
      height,
      padAngle,
    };
  },
});
