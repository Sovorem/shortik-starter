import type { Database } from "bun:sqlite";
import { mkdirSync } from "fs";
import { openDatabase } from "./db/db";

export type ApiConfig = {
  db: Database;
  jwtSecret: string;
  platform: string;
  filepathRoot: string;
  assetsRoot: string;
  s3Bucket: string;
  s3Region: string;
  s3CfDistribution: string;
  port: string;
};

// Reads a required variable from .env (Bun loads it automatically) and refuses to start without it.
function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`.env: ${name} must be set`);
  }
  return value;
}

const assetsRoot = env("ASSETS_ROOT");
mkdirSync(assetsRoot, { recursive: true });

export const cfg: ApiConfig = {
  db: openDatabase(env("DB_PATH")),
  jwtSecret: env("JWT_SECRET"),
  platform: env("PLATFORM"),
  filepathRoot: env("FILEPATH_ROOT"),
  assetsRoot,
  s3Bucket: env("S3_BUCKET"),
  s3Region: env("S3_REGION"),
  s3CfDistribution: env("S3_CF_DISTRO"),
  port: env("PORT"),
};
