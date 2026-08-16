import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { UserNotAuthenticatedError } from "./api/errors";

export const ACCESS_TOKEN_ISSUER = "shortik-access";

// Passwords: argon2id through Bun's built-in hasher — never store the plain text.
export function hashPassword(password: string): Promise<string> {
  return Bun.password.hash(password, { algorithm: "argon2id" });
}

export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  try {
    return await Bun.password.verify(password, hash);
  } catch {
    return false;
  }
}

// Access tokens: short-lived signed JWTs whose subject is the user id.
export function makeJWT(userID: string, secret: string, expiresInSeconds: number): string {
  return jwt.sign({ sub: userID }, secret, {
    algorithm: "HS256",
    issuer: ACCESS_TOKEN_ISSUER,
    expiresIn: expiresInSeconds,
  });
}

// Returns the user id inside a valid token, or throws a 401-flavoured error.
export function validateJWT(token: string, secret: string): string {
  let payload: jwt.JwtPayload | string;
  try {
    payload = jwt.verify(token, secret, { algorithms: ["HS256"] });
  } catch {
    throw new UserNotAuthenticatedError("Անվավեր կամ ժամկետանց token");
  }
  if (typeof payload === "string" || payload.iss !== ACCESS_TOKEN_ISSUER) {
    throw new UserNotAuthenticatedError("Անվավեր issuer");
  }
  if (!payload.sub) {
    throw new UserNotAuthenticatedError("Subject-ը (user ID) բացակայում է");
  }
  return payload.sub;
}

// Pulls the token out of `Authorization: Bearer <token>`.
export function getBearerToken(headers: Headers): string {
  const authorization = headers.get("Authorization");
  if (!authorization) {
    throw new UserNotAuthenticatedError("Authorization Header-ը բացակայում է");
  }
  const [scheme, token, ...rest] = authorization.trim().split(/\s+/);
  if (scheme !== "Bearer" || !token || rest.length > 0) {
    throw new UserNotAuthenticatedError("Սխալ ձևաչափի Authorization header");
  }
  return token;
}

// Refresh tokens are 32 random bytes as hex — opaque, stored server-side.
export function makeRefreshToken(): string {
  return randomBytes(32).toString("hex");
}
