import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import node from "@astrojs/node";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

const env = loadEnv(process.env.NODE_ENV ?? "production", process.cwd(), "");

for (const [key, value] of Object.entries(env)) process.env[key] ??= value;

const domains = [
  ...(env.ALLOWED_DOMAINS || "localhost,127.0.0.1").split(","),
  env.VERCEL_PROJECT_PRODUCTION_URL,
  env.VERCEL_BRANCH_URL,
  env.VERCEL_URL,
]
  .map((d) => d?.trim())
  .filter(Boolean);

const adapter =
  process.env.ASTRO_ADAPTER === "node"
    ? node({ mode: "standalone" })
    : vercel();

export default defineConfig({
  output: "server",
  adapter,
  prefetch: { defaultStrategy: "hover" },
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
  server: { host: true, port: 4321 },
  devToolbar: { enabled: false },
  security: {
    checkOrigin: true,
    allowedDomains: [...new Set(domains)].map((hostname) => ({ hostname })),
  },
});
