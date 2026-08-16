import type { BunRequest } from "bun";
import type { ApiConfig } from "../config";
import { resetDatabase } from "../db/db";
import { UserForbiddenError } from "./errors";
import { respondWithJSON } from "./json";

// POST /admin/reset — dev convenience: empties the database. Refused outside PLATFORM=dev.
export async function handlerReset(cfg: ApiConfig, _req: BunRequest) {
  if (cfg.platform !== "dev") {
    throw new UserForbiddenError("Reset-ը թույլատրված է միայն dev միջավայրում:");
  }
  resetDatabase(cfg.db);
  return respondWithJSON(200, { message: "Database-ը վերականգնվեց ելակետային վիճակի" });
}
