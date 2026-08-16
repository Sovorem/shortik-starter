import type { BunRequest } from "bun";
import type { ApiConfig } from "../config";
import { respondWithJSON } from "./json";

// POST /api/holovak_upload/:holovakId (multipart, field "video")
// Empty on purpose — the S3 chapter of the course builds this handler.
export async function handlerUploadHolovak(cfg: ApiConfig, req: BunRequest) {
  return respondWithJSON(200, null);
}
