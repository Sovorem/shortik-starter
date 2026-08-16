import path from "path";
import { cfg } from "./config";
import { cacheMiddleware, errorHandlingMiddleware, withConfig, type Handler } from "./api/middleware";
import { handlerLogin, handlerRefresh, handlerRevoke } from "./api/auth";
import { handlerUsersCreate } from "./api/users";
import { handlerReset } from "./api/reset";
import {
  handlerHolovakGet,
  handlerHolovakMetaCreate,
  handlerHolovakMetaDelete,
  handlerHolovaknerRetrieve,
} from "./api/holovak-meta";
import { handlerUploadThumbnail, handlerGetThumbnail } from "./api/thumbnails";
import { handlerUploadHolovak } from "./api/holovakner";
import app from "./app/index.html";

const route = (handler: Handler) => withConfig(cfg, handler);

// Static files under ASSETS_ROOT are served at /assets/<name> (thumbnails end up here later in the course).
async function serveAsset(req: Request): Promise<Response> {
  const name = new URL(req.url).pathname.slice("/assets/".length);
  const file = Bun.file(path.join(cfg.assetsRoot, name));
  if (!name || name.includes("..") || !(await file.exists())) {
    return new Response("Ֆայլը չգտնվեց", { status: 404 });
  }
  return new Response(file, { headers: { "Content-Type": file.type || "application/octet-stream" } });
}

const server = Bun.serve({
  port: Number(cfg.port),
  development: cfg.platform === "dev",
  routes: {
    "/": app,
    "/api/users": { POST: route(handlerUsersCreate) },
    "/api/login": { POST: route(handlerLogin) },
    "/api/refresh": { POST: route(handlerRefresh) },
    "/api/revoke": { POST: route(handlerRevoke) },
    "/api/holovakner": {
      GET: route(handlerHolovaknerRetrieve),
      POST: route(handlerHolovakMetaCreate),
    },
    "/api/holovakner/:holovakId": {
      GET: route(handlerHolovakGet),
      DELETE: route(handlerHolovakMetaDelete),
    },
    "/api/thumbnail_upload/:holovakId": { POST: route(handlerUploadThumbnail) },
    "/api/thumbnails/:holovakId": { GET: route(handlerGetThumbnail) },
    "/api/holovak_upload/:holovakId": { POST: route(handlerUploadHolovak) },
    "/admin/reset": { POST: route(handlerReset) },
  },
  fetch(req) {
    if (new URL(req.url).pathname.startsWith("/assets/")) {
      return cacheMiddleware(serveAsset)(req);
    }
    return new Response("Չի գտնվել", { status: 404 });
  },
  error(err) {
    return errorHandlingMiddleware(cfg, err);
  },
});

console.log(`Server-ը աշխատում է այստեղ՝ ${server.url}`);
