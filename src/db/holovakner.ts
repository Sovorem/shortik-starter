import { randomUUID } from "crypto";
import type { Database } from "bun:sqlite";

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
  thumbnail_url?: string;
  video_url?: string;
  user_id: string;
};

export function getHolovakner(db: Database, userID: string): Holovak[] {
  const sql = `
    SELECT
      id,
      created_at,
      updated_at,
      title,
      description,
      thumbnail_url,
      video_url,
      user_id
    FROM holovakner
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  const rows = db.query<HolovakRow, [string]>(sql).all(userID);

  const holovakner: Holovak[] = rows.map((row) => ({
    id: row.id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    title: row.title,
    description: row.description,
    thumbnailURL: row.thumbnail_url,
    videoURL: row.video_url,
    userID: row.user_id,
  }));

  return holovakner;
}

export function createHolovak(
  db: Database,
  params: CreateHolovakParams,
): Holovak | undefined {
  const id = randomUUID();

  const sql = `
    INSERT INTO holovakner (
      id,
      created_at,
      updated_at,
      title,
      description,
      user_id
    ) VALUES (
      ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?, ?
    )
  `;

  db.run(sql, [id, params.title, params.description, params.userID]);

  return getHolovak(db, id);
}

export function getHolovak(db: Database, id: string): Holovak | undefined {
  const sql = `
    SELECT
      id,
      created_at,
      updated_at,
      title,
      description,
      thumbnail_url,
      video_url,
      user_id
    FROM holovakner
    WHERE id = ?
  `;

  const row = db.query<HolovakRow, [string]>(sql).get(id);

  if (!row) {
    return;
  }

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

export function updateHolovak(db: Database, holovak: Holovak): void {
  const sql = `
    UPDATE holovakner
    SET
      title = ?,
      description = ?,
      thumbnail_url = ?,
      video_url = ?,
      user_id = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(sql, [
    holovak.title,
    holovak.description,
    holovak.thumbnailURL ?? null,
    holovak.videoURL ?? null,
    holovak.userID,
    holovak.id,
  ]);
}

export function deleteHolovak(db: Database, id: string): void {
  const sql = `
    DELETE FROM holovakner
    WHERE id = ?
  `;
  db.run(sql, [id]);
}
