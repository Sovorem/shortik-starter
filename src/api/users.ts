import type { BunRequest } from "bun";
import type { ApiConfig } from "../config";
import { hashPassword } from "../auth";
import { createUser } from "../db/users";
import { BadRequestError } from "./errors";
import { respondWithJSON } from "./json";

// POST /api/users → 201 { id, email, createdAt, updatedAt }
export async function handlerUsersCreate(cfg: ApiConfig, req: BunRequest) {
  const { email, password } = (await req.json()) as { email?: string; password?: string };
  if (!email || !password) {
    throw new BadRequestError("Email-ը և password-ը պարտադիր են");
  }
  const user = createUser(cfg.db, email, await hashPassword(password));
  return respondWithJSON(201, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}
