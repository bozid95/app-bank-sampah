import { prisma } from "./prisma";
import { ECO_LEVELS, resolveEcoLevels, type EcoLevel } from "./ecoImpact";
import type { AppConfig, Prisma } from "../generated/prisma/client";

export const THEME_MODES = [
  { value: "system", label: "Ikuti perangkat" },
  { value: "light", label: "Terang (Light)" },
  { value: "dark", label: "Gelap (Dark)" },
] as const;

export type ThemeMode = (typeof THEME_MODES)[number]["value"];

export type AppConfigData = Omit<
  AppConfig,
  "id" | "updatedAt" | "ecoLevels" | "defaultTheme"
> & {
  defaultTheme: ThemeMode;
  ecoLevels: EcoLevel[];
};

export const DEFAULT_CONFIG: AppConfigData = {
  appName: "Bank Sampah",
  organizationName: "Bank Sampah",
  tagline: "Tabung sampahmu, kumpulkan saldonya",
  address: null,
  phone: null,
  email: null,
  primaryColor: "#1f7a4d",
  defaultTheme: "system",
  accountNumberPrefix: "BS",
  timezone: "Asia/Jakarta",
  receiptFooter: null,
  warnWeightKg: 100,
  warnWithdrawAmount: 1_000_000,
  ecoLevels: [...ECO_LEVELS],
};

export const TIMEZONES = [
  {
    value: "Asia/Jakarta",
    label: "WIB — Waktu Indonesia Barat",
    short: "WIB",
    offsetHours: 7,
  },
  {
    value: "Asia/Makassar",
    label: "WITA — Waktu Indonesia Tengah",
    short: "WITA",
    offsetHours: 8,
  },
  {
    value: "Asia/Jayapura",
    label: "WIT — Waktu Indonesia Timur",
    short: "WIT",
    offsetHours: 9,
  },
] as const;

export const getTimezone = (tz: string) =>
  TIMEZONES.find((t) => t.value === tz) ?? TIMEZONES[0];

export const isHexColor = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);
export const isAccountPrefix = (v: string) => /^[A-Z0-9]{1,6}$/.test(v);
export const isThemeMode = (v: string): v is ThemeMode =>
  v === "system" || v === "light" || v === "dark";

function sanitize(
  c: Omit<AppConfigData, "ecoLevels" | "defaultTheme"> & {
    ecoLevels: unknown;
    defaultTheme?: string;
  },
): AppConfigData {
  const nonNegInt = (v: unknown, fallback: number) =>
    typeof v === "number" && Number.isInteger(v) && v >= 0 ? v : fallback;
  return {
    ...c,
    primaryColor: isHexColor(c.primaryColor)
      ? c.primaryColor
      : DEFAULT_CONFIG.primaryColor,
    defaultTheme:
      c.defaultTheme && isThemeMode(c.defaultTheme)
        ? c.defaultTheme
        : DEFAULT_CONFIG.defaultTheme,
    accountNumberPrefix: isAccountPrefix(c.accountNumberPrefix)
      ? c.accountNumberPrefix
      : DEFAULT_CONFIG.accountNumberPrefix,
    timezone: getTimezone(c.timezone).value,
    warnWeightKg: nonNegInt(c.warnWeightKg, DEFAULT_CONFIG.warnWeightKg),
    warnWithdrawAmount: nonNegInt(
      c.warnWithdrawAmount,
      DEFAULT_CONFIG.warnWithdrawAmount,
    ),
    ecoLevels: resolveEcoLevels(c.ecoLevels),
  };
}

const CACHE_TTL_MS = 30_000;
let cache: { value: AppConfigData; at: number } | null = null;

export async function getAppConfig(): Promise<AppConfigData> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.value;
  const row = await prisma.appConfig.findUnique({ where: { id: 1 } });
  const {
    id: _id,
    updatedAt: _u,
    ...data
  } = row ?? { id: 1, updatedAt: new Date(), ...DEFAULT_CONFIG };
  const value = sanitize(data);
  cache = { value, at: Date.now() };
  return value;
}

export async function saveAppConfig(data: AppConfigData) {
  const clean = sanitize(data);
  const storedLevels: Prisma.InputJsonValue = clean.ecoLevels.map(
    ({ name, minKg, tagline }) => ({
      name,
      minKg,
      tagline,
    }),
  );
  const payload = { ...clean, ecoLevels: storedLevels };
  await prisma.appConfig.upsert({
    where: { id: 1 },
    create: { id: 1, ...payload },
    update: payload,
  });
  cache = { value: clean, at: Date.now() };
}

export const brandStyle = (c: AppConfigData) =>
  `:root{--brand:${sanitize(c).primaryColor};}`;
