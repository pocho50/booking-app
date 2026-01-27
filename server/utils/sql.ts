export const toJsonSafe = (value: unknown): unknown => {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => toJsonSafe(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, toJsonSafe(entry)]),
    );
  }

  return value;
};

export const validateSql = (sql: string): void => {
  const normalized = sql.trim().replace(/;+$|;+(\s*)$/g, "");
  const lower = normalized.toLowerCase();

  if (!lower.startsWith("select")) {
    throw new Error("Only SELECT queries are allowed");
  }

  if (normalized.includes(";")) {
    throw new Error("Multiple statements are not allowed");
  }

  if (lower.includes("information_schema") || lower.includes("pg_catalog")) {
    throw new Error("System schemas are not allowed");
  }

  if (lower.includes("sqlite_master") || lower.includes("sqlite_schema")) {
    throw new Error("System tables are not allowed");
  }

  if (/\b(insert|update|delete|drop|alter|truncate|create)\b/i.test(lower)) {
    throw new Error("Mutating queries are not allowed");
  }

  if (lower.includes("users")) {
    throw new Error("Users table is not allowed");
  }
};
