import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { join } from "node:path";

export type StoredExportMeta = {
  id: string;
  filename: string;
  mimeType: string;
  createdAt: string;
};

const EXPORTS_DIR = join(process.cwd(), ".tmp", "exports");

export async function ensureExportsDir() {
  await mkdir(EXPORTS_DIR, { recursive: true });
}

export function exportFilePath(id: string) {
  return join(EXPORTS_DIR, `${id}.bin`);
}

export function exportMetaPath(id: string) {
  return join(EXPORTS_DIR, `${id}.json`);
}

export async function writeExport(params: {
  id: string;
  filename: string;
  mimeType: string;
  content: string;
}) {
  await ensureExportsDir();

  const meta: StoredExportMeta = {
    id: params.id,
    filename: params.filename,
    mimeType: params.mimeType,
    createdAt: new Date().toISOString(),
  };

  await writeFile(exportFilePath(params.id), params.content, "utf8");
  await writeFile(exportMetaPath(params.id), JSON.stringify(meta), "utf8");

  return meta;
}

export async function readExportMeta(id: string): Promise<StoredExportMeta | null> {
  try {
    const raw = await readFile(exportMetaPath(id), "utf8");
    return JSON.parse(raw) as StoredExportMeta;
  } catch {
    return null;
  }
}

export function createExportReadStream(id: string) {
  return createReadStream(exportFilePath(id));
}
