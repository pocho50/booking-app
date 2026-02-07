import { tool } from "ai";
import type { UIToolInvocation } from "ai";
import { z } from "zod";

export type SendEmailUIToolInvocation = UIToolInvocation<typeof sendEmailTool>;
export const sendEmailTool = tool({
  description:
    "Send an email with the provided report/content. Use this when the user asks to receive the information by email.",
  inputSchema: z.object({
    to: z
      .array(z.string().email())
      .optional()
      .describe(
        "Optional recipients. If omitted, a default recipient from server config will be used.",
      ),
    subject: z.string().min(1).describe("Email subject"),
    text: z.string().optional().describe("Plain text email body"),
    html: z.string().optional().describe("HTML email body"),
  }),
  execute: async ({ to, subject, text, html }) => {
    const { getMailgunConfig } = await import("~~/server/utils/mailgunConfig");
    const mailgunConfig = getMailgunConfig();

    const apiKey = mailgunConfig.apiKey;
    const domain = mailgunConfig.domain;
    const from = mailgunConfig.from;
    const defaultTo = mailgunConfig.to;

    if (!apiKey) throw new Error("Missing Mailgun API key");
    if (!domain) throw new Error("Missing Mailgun domain");
    if (!from) throw new Error("Missing Mailgun from");

    const resolvedTo =
      to && to.length
        ? to
        : defaultTo.trim()
          ? defaultTo
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [];

    if (!resolvedTo.length) {
      throw new Error("Missing recipient. Provide 'to' or set NUXT_MAILGUN_TO");
    }

    if (!text && !html) {
      throw new Error("Missing email body. Provide 'text' or 'html'");
    }

    const { default: FormData } = await import("form-data");
    const { default: Mailgun } = await import("mailgun.js");

    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: "api",
      key: apiKey,
    });

    const messageDataBase = {
      from,
      to: resolvedTo,
      subject,
    };

    const messageData =
      typeof html === "string"
        ? { ...messageDataBase, html }
        : { ...messageDataBase, text: text as string };

    type MailgunMessagesCreateResult = Awaited<
      ReturnType<typeof mg.messages.create>
    >;

    let data: MailgunMessagesCreateResult;
    try {
      data = await mg.messages.create(domain, messageData);
    } catch (error) {
      console.error("[sendEmailTool] Mailgun error", error);

      const err = error as any;
      const status =
        typeof err?.status === "number"
          ? err.status
          : typeof err?.statusCode === "number"
            ? err.statusCode
            : undefined;

      const message =
        typeof err?.message === "string"
          ? err.message
          : typeof err?.details === "string"
            ? err.details
            : "Unknown error";

      const detailsRaw = err?.details ?? err?.body ?? err?.response?.body;
      const detailsText =
        typeof detailsRaw === "string"
          ? detailsRaw
          : detailsRaw
            ? JSON.stringify(detailsRaw)
            : "";

      const statusText = status ? ` (status ${status})` : "";
      const detailsSuffix = detailsText ? `: ${detailsText}` : "";

      throw new Error(`Mailgun error${statusText}: ${message}${detailsSuffix}`);
    }

    return {
      to: resolvedTo,
      subject,
      id: data.id,
      message: data.message,
    };
  },
});
