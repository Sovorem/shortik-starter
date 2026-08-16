import { randomUUID } from "crypto";
import type { Database } from "bun:sqlite";

// A holovak = one clip: its metadata lives here, the thumbnail and the video file
// are stored elsewhere and only referenced by URL.
export type Holovak = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  description: string;
  thumbnailURL?: string;
  videoURL?: string;
  userID: string;
};

export type CreateHolovakParams = {
  title: string;
  description: string;
  userID: string;
};

type HolovakRow = {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  video_url: string | null;
  user_id: string;
};

const COLUMNS = "id, created_at, updated_at, title, description, thumbnail_url, video_url, user_id";

function toHolovak(row: HolovakRow): Holovak {
  return {
    id: row.id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    title: row.title,
    description: row.description,
    thumbnailURL: row.thumbnail_url ?? undefined,
    videoURL: row.video_url ?? undefined,
    userID: row.user_id,
  };
}

// Newest first — the UI (and the course's tests) rely on this order.
export function getHolovakner(db: Database, userID: string): Holovak[] {
  return db
    .query<HolovakRow, [string]>(`SELECT ${COLUMNS} FROM holovakner WHERE user_id = ? ORDER BY created_at DESC`)
    .all(userID)
    .map(toHolovak);
}

export function getHolovak(db: Database, id: string): Holovak | undefined {
  const row = db.query<HolovakRow, [string]>(`SELECT ${COLUMNS} FROM holovakner WHERE id = ?`).get(id);
  return row ? toHolovak(row) : undefined;
}

export function createHolovak(db: Database, params: CreateHolovakParams): Holovak {
  const id = randomUUID();
  db.run("INSERT INTO holovakner (id, title, description, user_id) VALUES (?, ?, ?, ?)", [
    id,
    params.title,
    params.description,
    params.userID,
  ]);
  return getHolovak(db, id)!;
}

// Writes back every editable column of an in-memory Holovak (used after an upload sets a URL).
export function updateHolovak(db: Database, holovak: Holovak): void {
  db.run(
    `UPDATE holovakner
        SET title = ?, description = ?, thumbnail_url = ?, video_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
    [holovak.title, holovak.description, holovak.thumbnailURL ?? null, holovak.videoURL ?? null, holovak.id],
  );
}

export function deleteHolovak(db: Database, id: string): void {
  db.run("DELETE FROM holovakner WHERE id = ?", [id]);
}
