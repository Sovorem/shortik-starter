import { type ApiConfig } from "../config";
import { getBearerToken, validateJWT } from "../auth";
import { createHolovak, deleteHolovak, getHolovak, getHolovakner } from "../db/holovakner";
import { respondWithJSON } from "./json";
import { BadRequestError, NotFoundError, UserForbiddenError } from "./errors";
import type { BunRequest } from "bun";

export async function handlerHolovakMetaCreate(cfg: ApiConfig, req: Request) {
  const token = getBearerToken(req.headers);
  const userID = validateJWT(token, cfg.jwtSecret);

  const { title, description } = await req.json();
  if (!title || !description) {
    throw new BadRequestError("Title-ը կամ description-ը բացակայում է");
  }

  const holovak = createHolovak(cfg.db, {
    userID,
    title,
    description,
  });

  return respondWithJSON(201, holovak);
}

export async function handlerHolovakMetaDelete(cfg: ApiConfig, req: BunRequest) {
  const { holovakId } = req.params as { holovakId?: string };
  if (!holovakId) {
    throw new BadRequestError("Անվավեր հոլովակի ID");
  }

  const token = getBearerToken(req.headers);
  const userID = validateJWT(token, cfg.jwtSecret);

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

export async function handlerHolovakGet(cfg: ApiConfig, req: BunRequest) {
  const { holovakId } = req.params as { holovakId?: string };
  if (!holovakId) {
    throw new BadRequestError("Անվավեր հոլովակի ID");
  }

  const holovak = getHolovak(cfg.db, holovakId);
  if (!holovak) {
    throw new NotFoundError("Հոլովակը չգտնվեց");
  }

  return respondWithJSON(200, holovak);
}

export async function handlerHolovaknerRetrieve(cfg: ApiConfig, req: Request) {
  const token = getBearerToken(req.headers);
  const userID = validateJWT(token, cfg.jwtSecret);

  const holovakner = getHolovakner(cfg.db, userID);
  return respondWithJSON(200, holovakner);
}
