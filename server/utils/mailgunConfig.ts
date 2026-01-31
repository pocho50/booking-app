export function getMailgunConfig() {
  const config = useRuntimeConfig();

  const apiKeyRaw = (config as any).mailgunApiKey;
  const domainRaw = (config as any).mailgunDomain;
  const fromRaw = (config as any).mailgunFrom;
  const toRaw = (config as any).mailgunTo;

  const apiKey = typeof apiKeyRaw === "string" ? apiKeyRaw : "";
  const domain = typeof domainRaw === "string" ? domainRaw : "";
  const from = typeof fromRaw === "string" ? fromRaw : "";
  const to = typeof toRaw === "string" ? toRaw : "";

  return {
    apiKey,
    domain,
    from,
    to,
  };
}
