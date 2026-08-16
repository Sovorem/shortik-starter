import { respondWithJSON } from "./json";

import { type ApiConfig } from "../config";
import type { BunRequest } from "bun";

export async function handlerUploadHolovak(cfg: ApiConfig, req: BunRequest) {
  return respondWithJSON(200, null);
}
