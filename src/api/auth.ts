import type { BunRequest } from "bun";
import type { ApiConfig } from "../config";
import { checkPasswordHash, getBearerToken, makeJWT, makeRefreshToken } from "../auth";
import { createRefreshToken, revokeRefreshToken } from "../db/refresh-tokens";
import { getUserByEmail, getUserByRefreshToken } from "../db/users";
import { BadRequestError, UserNotAuthenticatedError } from "./errors";
import { respondWithJSON } from "./json";

const ACCESS_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60; // a month — generous on purpose for a course project
const REFRESH_TOKEN_TTL_MS = 60 * 24 * 60 * 60 * 1000;

type Credentials = { email?: string; password?: string };

// POST /api/login → { user, token, refreshToken }
export async function handlerLogin(cfg: ApiConfig, req: BunRequest) {
  const { email, password } = (await req.json()) as Credentials;
  if (!email || !password) {
    throw new BadRequestError("Email-ը և password-ը պարտադիր են");
  }

  const user = getUserByEmail(cfg.db, email);
  const ok = user ? await checkPasswordHash(password, user.password) : false;
  if (!user || !ok) {
    // same message either way — never tell a caller which half was wrong
    throw new UserNotAuthenticatedError("Սխալ email կամ password");
  }

  const refreshToken = makeRefreshToken();
  createRefreshToken(cfg.db, user.id, refreshToken, new Date(Date.now() + REFRESH_TOKEN_TTL_MS));

  return respondWithJSON(200, {
    user: { id: user.id, email: user.email, createdAt: user.createdAt, updatedAt: user.updatedAt },
    token: makeJWT(user.id, cfg.jwtSecret, ACCESS_TOKEN_TTL_SECONDS),
    refreshToken,
  });
}

// POST /api/refresh (Bearer <refreshToken>) → { token }
export async function handlerRefresh(cfg: ApiConfig, req: BunRequest) {
  const refreshToken = getBearerToken(req.headers);
  const user = getUserByRefreshToken(cfg.db, refreshToken);
  if (!user) {
    throw new UserNotAuthenticatedError("Անվավեր կամ ժամկետանց refresh token");
  }
  return respondWithJSON(200, { token: makeJWT(user.id, cfg.jwtSecret, 60 * 60) });
}

// POST /api/revoke (Bearer <refreshToken>) → 204
export async function handlerRevoke(cfg: ApiConfig, req: BunRequest) {
  revokeRefreshToken(cfg.db, getBearerToken(req.headers));
  return new Response(null, { status: 204 });
}
