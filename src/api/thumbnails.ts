import type { BunRequest } from "bun";
import type { ApiConfig } from "../config";
import { getBearerToken, validateJWT } from "../auth";
import { getHolovak } from "../db/holovakner";
import { BadRequestError, NotFoundError } from "./errors";
import { respondWithJSON } from "./json";

// First stop of the course: thumbnails are kept in this process's memory,
// keyed by holovak id. (Restart the server and they are gone — that's the point.)
export type Thumbnail = {
  data: ArrayBuffer;
  mediaType: string;
};

export const holovakThumbnails = new Map<string, Thumbnail>();

// GET /api/thumbnails/:holovakId → the raw image bytes from the map
export async function handlerGetThumbnail(cfg: ApiConfig, req: BunRequest) {
  const { holovakId } = req.params as { holovakId?: string };
  if (!holovakId) {
    throw new BadRequestError("Անվավեր հոլովակի ID");
  }
  if (!getHolovak(cfg.db, holovakId)) {
    throw new NotFoundError("Հոլովակը չգտնվեց");
  }
  const thumbnail = holovakThumbnails.get(holovakId);
  if (!thumbnail) {
    throw new NotFoundError("Thumbnail-ը չգտնվեց");
  }
  return new Response(thumbnail.data, {
    headers: { "Content-Type": thumbnail.mediaType, "Cache-Control": "no-store" },
  });
}

// POST /api/thumbnail_upload/:holovakId (multipart, field "thumbnail")
// Auth and the id are already handled — the course fills in the rest.
export async function handlerUploadThumbnail(cfg: ApiConfig, req: BunRequest) {
  const { holovakId } = req.params as { holovakId?: string };
  if (!holovakId) {
    throw new BadRequestError("Անվավեր հոլովակի ID");
  }
  const userID = validateJWT(getBearerToken(req.headers), cfg.jwtSecret);
  console.log(`վերբեռնվում է thumbnail-ը հոլովակ ${holovakId}-ի համար user ${userID}-ի կողմից`);

  // TODO: read the multipart form, keep the image, update the holovak

  return respondWithJSON(200, null);
}
