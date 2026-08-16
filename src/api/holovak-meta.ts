import type { BunRequest } from "bun";
import type { ApiConfig } from "../config";
import { getBearerToken, validateJWT } from "../auth";
import { createHolovak, deleteHolovak, getHolovak, getHolovakner } from "../db/holovakner";
import { BadRequestError, NotFoundError, UserForbiddenError } from "./errors";
import { respondWithJSON } from "./json";

// The metadata half of a holovak: create a draft, list, fetch one, delete.
// (Thumbnail and video uploads live in thumbnails.ts / holovakner.ts.)

function holovakIdOf(req: BunRequest): string {
  const { holovakId } = req.params as { holovakId?: string };
  if (!holovakId) {
    throw new BadRequestError("Անվավեր հոլովակի ID");
  }
  return holovakId;
}

// POST /api/holovakner { title, description } → 201 holovak (a draft: no files yet)
export async function handlerHolovakMetaCreate(cfg: ApiConfig, req: BunRequest) {
  const userID = validateJWT(getBearerToken(req.headers), cfg.jwtSecret);
  const { title, description } = (await req.json()) as { title?: string; description?: string };
  if (!title || !description) {
    throw new BadRequestError("Title-ը կամ description-ը բացակայում է");
  }
  const holovak = createHolovak(cfg.db, { title, description, userID });
  return respondWithJSON(201, holovak);
}

// DELETE /api/holovakner/:holovakId → 204 (owner only)
export async function handlerHolovakMetaDelete(cfg: ApiConfig, req: BunRequest) {
  const holovakId = holovakIdOf(req);
  const userID = validateJWT(getBearerToken(req.headers), cfg.jwtSecret);
  const holovak = getHolovak(cfg.db, holovakId);
  if (!holovak) {
    throw new NotFoundError("Հոլովակը չգտնվեց");
  }
  if (holovak.userID !== userID) {
    throw new UserForbiddenError("Թույլտվություն չկա ջնջելու այս հոլովակը");
  }
  deleteHolovak(cfg.db, holovakId);
  return new Response(null, { status: 204 });
}

// GET /api/holovakner/:holovakId → holovak
export async function handlerHolovakGet(cfg: ApiConfig, req: BunRequest) {
  const holovak = getHolovak(cfg.db, holovakIdOf(req));
  if (!holovak) {
    throw new NotFoundError("Հոլովակը չգտնվեց");
  }
  return respondWithJSON(200, holovak);
}

// GET /api/holovakner → the caller's holovakner, newest first
export async function handlerHolovaknerRetrieve(cfg: ApiConfig, req: BunRequest) {
  const userID = validateJWT(getBearerToken(req.headers), cfg.jwtSecret);
  const holovakner = getHolovakner(cfg.db, userID);
  return respondWithJSON(200, holovakner);
}
