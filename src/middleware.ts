import { defineMiddleware } from "astro:middleware";
import { getUserFromCookies } from "./lib/auth";
import { getAppConfig } from "./lib/config";
import { setTimeZone } from "./lib/format";

const PUBLIC_FILES = new Set([
  "/favicon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/manifest.webmanifest",
]);

const ADMIN_PREFIXES = [
  "/customers",
  "/waste-types",
  "/transactions",
  "/users",
  "/settings",
  "/data",
];

function applySecurityHeaders(response: Response) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  return response;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (pathname.startsWith("/_astro") || PUBLIC_FILES.has(pathname))
    return next();

  const config = await getAppConfig();
  setTimeZone(config.timezone);
  context.locals.config = config;

  const user = await getUserFromCookies(context.cookies);
  context.locals.user = user;

  if (pathname === "/login") {
    if (user) return context.redirect("/");
    const response = await next();
    response.headers.set("Cache-Control", "private, no-store");
    return applySecurityHeaders(response);
  }

  if (!user) return context.redirect("/login");

  const isAdminPath = ADMIN_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  if (isAdminPath && user.role !== "ADMIN") {
    return applySecurityHeaders(new Response("Akses ditolak", { status: 403 }));
  }
  if (
    (pathname === "/me" || pathname.startsWith("/me/")) &&
    user.role !== "USER"
  ) {
    return context.redirect("/");
  }

  const response = await next();
  response.headers.set("Cache-Control", "private, no-store");
  return applySecurityHeaders(response);
});
