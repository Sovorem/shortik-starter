import { type ApiConfig } from "../config";
import { reset } from "../db/db";
import { UserForbiddenError } from "./errors";
import { respondWithJSON } from "./json";

export async function handlerReset(cfg: ApiConfig, _: Request) {
  if (cfg.platform !== "dev") {
    throw new UserForbiddenError("Reset-ը թույլատրված է միայն dev միջավայրում:");
  }

  reset(cfg.db);
  return respondWithJSON(200, { message: "Database-ը վերականգնվեց ելակետային վիճակի" });
}
