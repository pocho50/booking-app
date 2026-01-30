import { sendStream, setResponseHeader } from "h3";
import {
  createExportReadStream,
  readExportMeta,
} from "../../utils/exportStore";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "id is required" });
  }

  const meta = await readExportMeta(id);
  if (!meta) {
    throw createError({ statusCode: 404, statusMessage: "Export not found" });
  }

  setResponseHeader(event, "Content-Type", meta.mimeType);
  setResponseHeader(
    event,
    "Content-Disposition",
    `attachment; filename="${meta.filename}"`,
  );

  return sendStream(event, createExportReadStream(id));
});
