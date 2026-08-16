import type { BunRequest } from "bun";
import type { ApiConfig } from "../config";
import { HttpError } from "./errors";
import { respondWithJSON } from "./json";

export type Handler = (cfg: ApiConfig, req: BunRequest) => Response | Promise<Response>;

// Binds the app config to a handler so Bun.serve can call it with just the request.
export function withConfig(cfg: ApiConfig, handler: Handler) {
  return (req: BunRequest) => handler(cfg, req);
}

// Wraps a plain fetch-style handler and stamps a Cache-Control header on whatever it returns.
export function cacheMiddleware(next: (req: Request) => Response | Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    const res = await next(req);
    const wrapped = new Response(res.body, res);
    wrapped.headers.set("Cache-Control", "max-age=3600");
    return wrapped;
  };
}

// Central error → JSON translation. HttpError subclasses keep their status,
// everything else is a 500 (with the real message only in dev).
export function errorHandlingMiddleware(cfg: ApiConfig, err: unknown): Response {
  if (err instanceof HttpError) {
    return respondWithJSON(err.status, { error: err.message });
  }
  const detail = err instanceof Error ? err.message : String(err);
  console.error(detail);
  const message = cfg.platform === "dev" ? detail : "Ինչ-որ սխալ տեղի ունեցավ մեր կողմից";
  return respondWithJSON(500, { error: message });
}
