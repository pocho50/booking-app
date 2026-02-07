import {
  streamText,
  UIMessage,
  convertToModelMessages,
  createGateway,
  stepCountIs,
  tool,
  zodSchema,
  wrapLanguageModel,
} from "ai";
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
    model: gateway("anthropic/claude-opus-4.5"),
    middleware: devToolsMiddleware(),
  });

  return defineEventHandler(async (event) => {
    const { messages }: { messages: UIMessage[] } = await readBody(event);

    const result = streamText({
      model,
      system: `You have the following data in the database (or Prisma schema) ${schema}

Generate a safe SQL SELECT query that answers the user's question.
You can only run SELECT queries; you cannot run INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, CREATE.
You cannot query the users table.
Keep in mind that inactive reservations (active = false) are not reservations, but disabled days for making reservations.
The total number of days in a reservation includes both the start day and the end day.
Before executing, review the SQL as if you were a senior reviewer:
- Does it really answer the question?
- Are there logical errors or duplications?
- Could it return incorrect data?
If you detect issues, fix the SQL before executing it.
You can run more than one SQL query if you need to validate or correct the result.
If the tool returns an error, fix the SQL and retry (maximum 2 retries).
Use the executeSql tool to run the query and then respond using the result.

You can return the information in whatever way you consider clearest:
- An HTML table
- A list
- A short summary
- Any combination that makes the report easier to read

If you generate HTML, make sure it is readable in both light mode and dark mode (avoid hardcoded colors; prefer neutral styling).

⚠️ Just make sure the data is correct, and if you generate HTML, it must be safe`,
      messages: await convertToModelMessages(messages),
      stopWhen: stepCountIs(8),
      onStepFinish: (step) => {
        console.log("[chat] step", {
          toolCalls: step.toolCalls.length,
          toolResults: step.toolResults.length,
          finishReason: step.finishReason,
          toolCall: step.toolCalls.map((tool) => tool.type).join("--"),
        });
      },
      onError: (error) => {
        console.error("[chat] stream error", error);
      },
      tools: {
        executeSql: tool({
          description: "Executes a SELECT query in the database",
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
        sendEmailTool,
      },
    });

    return result.toUIMessageStreamResponse();
  });
});
