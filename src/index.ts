import { cfg } from "./config";
import { handlerLogin, handlerRefresh, handlerRevoke } from "./api/auth";
import {
  errorHandlingMiddleware,
  cacheMiddleware,
  withConfig,
} from "./api/middleware";
import { handlerUsersCreate } from "./api/users";
import {
  handlerHolovakGet,
  handlerHolovakMetaCreate,
  handlerHolovakMetaDelete,
  handlerHolovaknerRetrieve,
} from "./api/holovak-meta";
import { handlerUploadHolovak } from "./api/holovakner";
import { handlerUploadThumbnail, handlerGetThumbnail } from "./api/thumbnails";
import { handlerReset } from "./api/reset";
import { ensureAssetsDir } from "./api/assets";
import spa from "./app/index.html";

ensureAssetsDir(cfg);

Bun.serve({
  port: Number(cfg.port),
  development: cfg.platform === "dev",
  routes: {
    "/": spa,
    "/api/login": {
      POST: withConfig(cfg, handlerLogin),
    },
    "/api/refresh": {
      POST: withConfig(cfg, handlerRefresh),
    },
    "/api/revoke": {
      POST: withConfig(cfg, handlerRevoke),
    },
    "/api/users": {
      POST: withConfig(cfg, handlerUsersCreate),
    },
    "/api/holovakner": {
      GET: withConfig(cfg, handlerHolovaknerRetrieve),
      POST: withConfig(cfg, handlerHolovakMetaCreate),
    },
    "/api/holovakner/:holovakId": {
      GET: withConfig(cfg, handlerHolovakGet),
      DELETE: withConfig(cfg, handlerHolovakMetaDelete),
    },
    "/api/thumbnail_upload/:holovakId": {
      POST: withConfig(cfg, handlerUploadThumbnail),
    },
    "/api/thumbnails/:holovakId": {
      GET: withConfig(cfg, handlerGetThumbnail),
    },
    "/api/holovak_upload/:holovakId": {
      POST: withConfig(cfg, handlerUploadHolovak),
    },
    "/admin/reset": {
      POST: withConfig(cfg, handlerReset),
    },
  },

  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path.startsWith("/assets")) {
      return cacheMiddleware(() =>
        serveStaticFile(path.replace("/assets/", ""), cfg.assetsRoot)
      )(req);
    }

    return new Response("Չի գտնվել", { status: 404 });
  },

  error(err) {
    return errorHandlingMiddleware(cfg, err);
  },
});

console.log(`Server-ը աշխատում է այստեղ՝ http://localhost:${cfg.port}`);

async function serveStaticFile(relativePath: string, basePath: string) {
  const filePath = `${basePath}/${relativePath}`;

  try {
    const f = Bun.file(filePath);
    return new Response(await f.bytes(), {
      headers: { "Content-Type": f.type || "application/octet-stream" },
    });
  } catch {
    return new Response("Ֆայլը չգտնվեց", { status: 404 });
  }
}
