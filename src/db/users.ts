import { randomUUID } from "crypto";
import type { Database } from "bun:sqlite";

export type User = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  password: string;
};

type UserRow = {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  password: string;
};

const COLUMNS = "id, created_at, updated_at, email, password";

function toUser(row: UserRow): User {
  return {
    id: row.id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    email: row.email,
    password: row.password,
  };
}

export function createUser(db: Database, email: string, passwordHash: string): User {
  const id = randomUUID();
  db.run("INSERT INTO users (id, email, password) VALUES (?, ?, ?)", [id, email, passwordHash]);
  return getUser(db, id)!;
}

export function getUser(db: Database, id: string): User | undefined {
  const row = db.query<UserRow, [string]>(`SELECT ${COLUMNS} FROM users WHERE id = ?`).get(id);
  return row ? toUser(row) : undefined;
}

export function getUserByEmail(db: Database, email: string): User | undefined {
  const row = db.query<UserRow, [string]>(`SELECT ${COLUMNS} FROM users WHERE email = ?`).get(email);
  return row ? toUser(row) : undefined;
}

// Resolves the owner of a refresh token, but only while that token is unexpired and unrevoked.
export function getUserByRefreshToken(db: Database, token: string): User | undefined {
  const row = db
    .query<UserRow, [string]>(
      `SELECT u.id, u.created_at, u.updated_at, u.email, u.password
         FROM users u
         JOIN refresh_tokens rt ON rt.user_id = u.id
        WHERE rt.token = ?
          AND rt.revoked_at IS NULL
          AND rt.expires_at > CURRENT_TIMESTAMP`,
    )
    .get(token);
  return row ? toUser(row) : undefined;
}
