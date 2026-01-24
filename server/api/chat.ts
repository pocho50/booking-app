import {
  streamText,
  UIMessage,
  convertToModelMessages,
  createGateway,
  wrapLanguageModel,
} from "ai";

import { devToolsMiddleware } from "@ai-sdk/devtools";

export default defineLazyEventHandler(async () => {
  const apiKey = useRuntimeConfig().aiGatewayApiKey;
  if (!apiKey) throw new Error("Missing AI Gateway API key");
  const gateway = createGateway({
    apiKey: apiKey,
  });

  const model = wrapLanguageModel({
    model: gateway("anthropic/claude-sonnet-4.5"),
    middleware: devToolsMiddleware(),
  });

  return defineEventHandler(async (event: any) => {
    const { messages }: { messages: UIMessage[] } = await readBody(event);

    const result = streamText({
      model,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  });
});
