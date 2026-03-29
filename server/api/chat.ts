import { streamText, convertToModelMessages, createGateway, stepCountIs, tool, zodSchema, wrapLanguageModel } from "ai";
import type { UIMessage } from "ai";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { devToolsMiddleware } from "@ai-sdk/devtools";
import { z } from "zod";
import { prisma } from "../utils/db";
import { toJsonSafe, validateSql } from "../utils/sql";
import { chartLineTool } from "../../shared/utils/tools/chartLineTool";
import { chartBarTool } from "../../shared/utils/tools/chartBarTool";
import { chartDonutTool } from "../../shared/utils/tools/chartDonutTool";
import { exportFileTool } from "../../shared/utils/tools/exportFileTool";
import { sendEmailTool } from "../../shared/utils/tools/sendEmailTool";
import { clientBalanceTool } from "../../shared/utils/tools/clientBalanceTool";

export default defineLazyEventHandler(async () => {
  const apiKey = useRuntimeConfig().aiGatewayApiKey;
  if (!apiKey) throw new Error("Missing AI Gateway API key");
  const gateway = createGateway({
    apiKey: apiKey,
  });

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const schema = readFileSync(
    resolve(__dirname, "../../prisma/schema.prisma"),
    "utf8",
  );

  const model = wrapLanguageModel({
    model: gateway("anthropic/claude-haiku-4.5"),
    middleware: devToolsMiddleware(),
  });

  return defineEventHandler(async (event) => {
    const session = await requireUserSession(event);
    const isAdmin = session.user.role === "ADMIN";
    const { messages }: { messages: UIMessage[] } = await readBody(event);

    const result = streamText({
      model,
      system: `You have the following data in the database (or Prisma schema) ${schema}

Generate a safe SQL SELECT query that answers the user's question.
CRITICAL RULE - NO EXCEPTIONS: You are FORBIDDEN from doing mental math. NEVER calculate totals, sums, averages, or any arithmetic in your head or in your response text. ALWAYS use SQL aggregate functions: SUM(), COUNT(), AVG(), MAX(), MIN(). The numbers shown to the user MUST come directly from a SQL query result.
You can only run SELECT queries; you cannot run INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, CREATE.
You cannot query the users table.
Keep in mind that inactive reservations (active = false) are not reservations, but disabled days for making reservations.
The total number of days in a reservation includes both the start day and the end day.
Before executing, review the SQL as if you were a senior reviewer:
- Does it really answer the question?
- Are there logical errors or duplications?
- Could it return incorrect data?
- CRITICAL: If showing totals/averages/aggregates, did you use SQL functions (SUM, COUNT, AVG) or did you mistakenly calculate mentally? Fix it if you calculated mentally.
If you detect issues, fix the SQL before executing it.
You can run more than one SQL query if you need to validate or correct the result.
If the tool returns an error, fix the SQL and retry (maximum 2 retries).
Use the executeSql tool to run the query and then respond using ONLY the result returned by the tool. All numbers must come from the SQL query, never from your own calculations.

You can return the information in whatever way you consider clearest:
- An HTML table
- A list
- A short summary
- Any combination that makes the report easier to read

If you generate HTML, make sure it is readable in both light mode and dark mode (avoid hardcoded colors; prefer neutral styling).

${!isAdmin ? "\nIMPORTANT: The current user does NOT have administrator privileges. If they ask to send an email, politely explain that only administrators can send emails.\n" : ""}
⚠️ Just make sure the data is correct, and if you generate HTML, it must be safe`,
      messages: await convertToModelMessages(messages),
      stopWhen: stepCountIs(8),
      onStepFinish: (step) => {
        console.log("[chat] step", {
          toolCalls: step.toolCalls.length,
          toolResults: step.toolResults.length,
          finishReason: step.finishReason,
          toolCall: step.toolCalls.map((tc) => tc?.type).join("--"),
        });
      },
      onError: (error) => {
        console.error("[chat] stream error", error);
      },
      tools: {
        executeSql: tool({
          description: "Executes a SELECT query in the database. Use SQL aggregate functions (SUM, COUNT, AVG, etc.) for all calculations. Never calculate manually.",
          inputSchema: zodSchema(
            z.object({
              sql: z.string().min(1),
            }),
          ),
          execute: async ({ sql }: { sql: string }) => {
            const normalized = sql.trim().replace(/;+$|;+(\s*)$/g, "");

            validateSql(normalized);

            try {
              await prisma.$queryRawUnsafe(`EXPLAIN QUERY PLAN ${normalized}`);
            } catch (error) {
              throw new Error(
                `SQL validation failed. Please fix the query. Details: ${String(error)}`,
              );
            }

            const rows = await prisma.$queryRawUnsafe(normalized);

            return toJsonSafe(rows);
          },
        }),
        chartLineTool,
        chartBarTool,
        chartDonutTool,
        exportFileTool,
        ...(isAdmin ? { sendEmailTool } : {}),
        clientBalanceTool,
      },
    });

    return result.toUIMessageStreamResponse();
  });
});
