import type { Database } from "bun:sqlite";

// Refresh tokens are opaque random strings; the row is the source of truth for
// expiry and revocation (see getUserByRefreshToken in users.ts for the lookup).
export function createRefreshToken(db: Database, userID: string, token: string, expiresAt: Date): void {
  db.run("INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES (?, ?, ?)", [
    token,
    userID,
    expiresAt.toISOString(),
  ]);
}

export function revokeRefreshToken(db: Database, token: string): void {
  db.run(
    "UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE token = ?",
    [token],
  );
}
