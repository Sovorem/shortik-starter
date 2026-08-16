import { getBearerToken, validateJWT } from "../auth";
import { respondWithJSON } from "./json";
import { getHolovak } from "../db/holovakner";
import type { ApiConfig } from "../config";
import type { BunRequest } from "bun";
import { BadRequestError, NotFoundError } from "./errors";

type Thumbnail = {
  data: ArrayBuffer;
  mediaType: string;
};

const holovakThumbnails: Map<string, Thumbnail> = new Map();

export async function handlerGetThumbnail(cfg: ApiConfig, req: BunRequest) {
  const { holovakId } = req.params as { holovakId?: string };
  if (!holovakId) {
    throw new BadRequestError("Անվավեր հոլովակի ID");
  }

  const holovak = getHolovak(cfg.db, holovakId);
  if (!holovak) {
    throw new NotFoundError("Հոլովակը չգտնվեց");
  }

  const thumbnail = holovakThumbnails.get(holovakId);
  if (!thumbnail) {
    throw new NotFoundError("Thumbnail-ը չգտնվեց");
  }

  return new Response(thumbnail.data, {
    headers: {
      "Content-Type": thumbnail.mediaType,
      "Cache-Control": "no-store",
    },
  });
}

export async function handlerUploadThumbnail(cfg: ApiConfig, req: BunRequest) {
  const { holovakId } = req.params as { holovakId?: string };
  if (!holovakId) {
    throw new BadRequestError("Անվավեր հոլովակի ID");
  }

  const token = getBearerToken(req.headers);
  const userID = validateJWT(token, cfg.jwtSecret);

  console.log(`վերբեռնվում է thumbnail-ը հոլովակ ${holovakId}-ի համար user ${userID}-ի կողմից`);

  // TODO: implement the upload here

  return respondWithJSON(200, null);
}
