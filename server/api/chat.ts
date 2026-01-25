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
import { devToolsMiddleware } from "@ai-sdk/devtools";
import { z } from "zod";
import { prisma } from "../utils/db";
import { toJsonSafe, validateSql } from "../utils/sql";

export default defineLazyEventHandler(async () => {
  const apiKey = useRuntimeConfig().aiGatewayApiKey;
  if (!apiKey) throw new Error("Missing AI Gateway API key");
  const gateway = createGateway({
    apiKey: apiKey,
  });

  const schema = readFileSync("prisma/schema.prisma", "utf8");

  const model = wrapLanguageModel({
    model: gateway("deepseek/deepseek-v3.2"),
    middleware: devToolsMiddleware(),
  });

  return defineEventHandler(async (event: any) => {
    const { messages }: { messages: UIMessage[] } = await readBody(event);

    const result = streamText({
      model,
      system: `Tienes los siguientes datos en la base de datos (o esquema Prisma) ${schema}

Genera un SQL SELECT seguro que responda a la pregunta del usuario.
Antes de ejecutar, revisa el SQL como si fueras un revisor senior:
- ¿Responde realmente la pregunta?
- ¿Hay errores logicos o duplicaciones?
- ¿Podria devolver datos incorrectos?
Si detectas problemas, corrige el SQL antes de ejecutarlo.
Puedes hacer mas de una consulta SQL si hace falta validar o corregir el resultado.
Si el tool devuelve un error, corrige el SQL y reintenta (maximo 2 reintentos).
Usa la herramienta executeSql para ejecutar la consulta y luego responde usando el resultado.

Puedes devolver la información de la manera que consideres más clara:
- Una tabla HTML
- Una lista
- Texto resumido
- Cualquier combinación que facilite la lectura del reporte

⚠️ Solo asegúrate de que los datos sean correctos y que si generas HTML sea seguro`,
      messages: await convertToModelMessages(messages),
      stopWhen: stepCountIs(5),
      onStepFinish: (step) => {
        console.log("[chat] step", {
          toolCalls: step.toolCalls.length,
          toolResults: step.toolResults.length,
          finishReason: step.finishReason,
        });
      },
      onError: (error) => {
        console.error("[chat] stream error", error);
      },
      tools: {
        executeSql: tool({
          description: "Ejecuta una consulta SELECT en la base de datos",
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
      },
    });

    return result.toUIMessageStreamResponse();
  });
});
