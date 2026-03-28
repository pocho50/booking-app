import { tool } from "ai";
import { z } from "zod";

export const clientBalanceTool = tool({
  description:
    "Calculate outstanding balances for clients. Returns each client with their saldo (balance = total reservation price - total paid). Can optionally filter by client ID or name.",
  inputSchema: z.object({
    clientId: z
      .string()
      .optional()
      .describe(
        "Optional client UUID to get the balance for a single client.",
      ),
    clientName: z
      .string()
      .optional()
      .describe(
        "Optional partial client name (first or last) to filter results. Ignored if clientId is provided.",
      ),
  }),
  execute: async ({ clientId, clientName }) => {
    const { PrismaClientRepository } = await import(
      "~~/server/infrastructure/prisma/PrismaClientRepository"
    );

    const repo = new PrismaClientRepository();
    const clients = await repo.listWithSaldo();

    let filtered = clients;

    if (clientId) {
      filtered = clients.filter((c) => c.id === clientId);
    } else if (clientName) {
      const search = clientName.toLowerCase();
      filtered = clients.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.last_name.toLowerCase().includes(search),
      );
    }

    return {
      count: filtered.length,
      clients: filtered,
    };
  },
});
