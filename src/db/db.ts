import { Database } from "bun:sqlite";

// SQLite is a single file: opening it creates it, and the schema below is idempotent,
// so a fresh clone boots with an empty-but-ready database.
const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  token      TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id    TEXT NOT NULL REFERENCES users(id),
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS holovakner (
  id            TEXT PRIMARY KEY,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  title         TEXT NOT NULL,
  description   TEXT,
  thumbnail_url TEXT,
  video_url     TEXT,
  user_id       TEXT REFERENCES users(id)
);
`;

export function openDatabase(path: string): Database {
  const db = new Database(path);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec(SCHEMA);
  return db;
}

// Dev-only helper behind POST /admin/reset: wipes every table, keeps the schema.
export function resetDatabase(db: Database): void {
  db.transaction(() => {
    db.exec("DELETE FROM refresh_tokens");
    db.exec("DELETE FROM holovakner");
    db.exec("DELETE FROM users");
  })();
}
