export function getMailgunConfig() {
  const config = useRuntimeConfig();

  const apiKeyRaw = config.mailgunApiKey;
  const domainRaw = config.mailgunDomain;
  const fromRaw = config.mailgunFrom;
  const toRaw = config.mailgunTo;

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
