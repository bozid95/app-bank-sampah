import { prisma } from "./prisma";
import { COUNTED } from "./transactions";

export type EcoLevelTone = "emerald" | "teal" | "sky" | "amber" | "violet";

export type EcoLevel = {
  level: number;
  name: string;
  minKg: number;
  tagline: string;
  tone: EcoLevelTone;
};

export const ECO_LEVELS: readonly EcoLevel[] = [
  {
    level: 1,
    name: "Pemula Hijau",
    minKg: 0,
    tagline: "Langkah awal menjaga bumi dimulai dari rumah.",
    tone: "emerald",
  },
  {
    level: 2,
    name: "Pejuang Pilah",
    minKg: 10,
    tagline: "Konsisten memilah sampah bernilai dari rumah.",
    tone: "teal",
  },
  {
    level: 3,
    name: "Sahabat Bumi",
    minKg: 30,
    tagline: "Kontribusi nyata mengurangi tumpukan sampah di TPA.",
    tone: "sky",
  },
  {
    level: 4,
    name: "Penjaga Lingkungan",
    minKg: 75,
    tagline: "Teladan pengelolaan sampah bagi warga sekitar.",
    tone: "amber",
  },
  {
    level: 5,
    name: "Pahlawan Bumi",
    minKg: 150,
    tagline: "Dedikasi luar biasa untuk bumi yang lebih bersih!",
    tone: "violet",
  },
];

export function resolveEcoLevels(raw: unknown): EcoLevel[] {
  if (!Array.isArray(raw) || raw.length !== ECO_LEVELS.length)
    return [...ECO_LEVELS];
  const result: EcoLevel[] = [];
  for (let i = 0; i < ECO_LEVELS.length; i++) {
    const def = ECO_LEVELS[i]!;
    const item = raw[i] as Record<string, unknown> | null | undefined;
    if (!item || typeof item !== "object") return [...ECO_LEVELS];
    const name =
      typeof item.name === "string" ? item.name.trim().slice(0, 40) : "";
    const minKg =
      i === 0
        ? 0
        : typeof item.minKg === "number" && Number.isFinite(item.minKg)
          ? Math.floor(item.minKg)
          : -1;
    const tagline =
      typeof item.tagline === "string" && item.tagline.trim()
        ? item.tagline.trim().slice(0, 120)
        : def.tagline;
    if (name.length < 2) return [...ECO_LEVELS];
    if (i > 0 && minKg <= result[i - 1]!.minKg) return [...ECO_LEVELS];
    result.push({ level: def.level, name, minKg, tagline, tone: def.tone });
  }
  return result;
}

export type EcoImpactSummary = {
  totalKg: number;
  totalKgLabel: string;
  co2SavedKg: number;
  co2Label: string;
  motorKm: number;
  motorKmLabel: string;
  treesPerYear: number;
  treesLabel: string;
  currentLevel: EcoLevel;
  nextLevel: EcoLevel | null;
  progressPercent: number;
  remainingKgLabel: string | null;
};

const numId = (v: number, maxDecimals = 1) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: maxDecimals }).format(
    v,
  );

export function co2FactorPerKg(wasteName: string): number {
  const n = wasteName.toLowerCase();
  if (/(aluminium|alumunium|kaleng)/.test(n)) return 9.0;
  if (/(besi|logam|seng|tembaga|baja|kuningan)/.test(n)) return 1.8;
  if (/(plastik|pet|hdpe|ldpe|pp|pvc|botol plastik|gelas plastik)/.test(n))
    return 1.5;
  if (/(kertas|kardus|hvs|koran|buku|duplek|karton)/.test(n)) return 1.0;
  if (/(kaca|beling|botol kaca)/.test(n)) return 0.3;
  return 1.0;
}

export function computeEcoImpact(
  items: { wasteName: string; weightKg: number }[],
  levels: readonly EcoLevel[] = ECO_LEVELS,
): EcoImpactSummary {
  let totalKg = 0;
  let co2SavedKg = 0;
  for (const item of items) {
    if (!Number.isFinite(item.weightKg) || item.weightKg <= 0) continue;
    totalKg += item.weightKg;
    co2SavedKg += item.weightKg * co2FactorPerKg(item.wasteName);
  }

  let currentIndex = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalKg >= levels[i]!.minKg) {
      currentIndex = i;
      break;
    }
  }
  const currentLevel = levels[currentIndex]!;
  const nextLevel = levels[currentIndex + 1] ?? null;

  let progressPercent = 100;
  let remainingKgLabel: string | null = null;
  if (nextLevel) {
    const span = nextLevel.minKg - currentLevel.minKg;
    const gained = Math.max(0, totalKg - currentLevel.minKg);
    progressPercent = Math.min(100, Math.round((gained / span) * 100));
    remainingKgLabel = `${numId(Math.max(0, nextLevel.minKg - totalKg), 1)} kg`;
  }

  const motorKm = Math.round(co2SavedKg / 0.1);
  const treesPerYear = co2SavedKg / 21;

  return {
    totalKg,
    totalKgLabel: `${numId(totalKg, 2)} kg`,
    co2SavedKg,
    co2Label: `${numId(co2SavedKg, 1)} kg`,
    motorKm,
    motorKmLabel: `${numId(motorKm, 0)} km`,
    treesPerYear,
    treesLabel:
      treesPerYear > 0 && treesPerYear < 0.1
        ? "< 0,1 pohon"
        : `${numId(treesPerYear, 1)} pohon`,
    currentLevel,
    nextLevel,
    progressPercent,
    remainingKgLabel,
  };
}

const WASTE_NAME_CACHE_TTL_MS = 30_000;
let wasteNameCache: { map: Map<number, string>; at: number } | null = null;

async function getWasteTypeNames(ids: number[]): Promise<Map<number, string>> {
  const now = Date.now();
  if (
    wasteNameCache &&
    now - wasteNameCache.at < WASTE_NAME_CACHE_TTL_MS &&
    ids.every((id) => wasteNameCache!.map.has(id))
  ) {
    return wasteNameCache.map;
  }
  const wasteTypes = await prisma.wasteType.findMany({
    select: { id: true, name: true },
  });
  const map = new Map(wasteTypes.map((w) => [w.id, w.name]));
  wasteNameCache = { map, at: now };
  return map;
}

async function aggregateByWasteType(customerId?: number) {
  const grouped = await prisma.depositItem.groupBy({
    by: ["wasteTypeId"],
    _sum: { weightKg: true },
    where: {
      transaction: {
        ...COUNTED,
        ...(customerId ? { customerId } : {}),
      },
    },
  });
  if (grouped.length === 0) return [];
  const names = await getWasteTypeNames(grouped.map((g) => g.wasteTypeId));
  return grouped.map((g) => ({
    wasteName: names.get(g.wasteTypeId) ?? "",
    weightKg: Number(g._sum.weightKg ?? 0),
  }));
}

export async function loadCustomerEcoImpact(
  customerId: number,
  levels: readonly EcoLevel[] = ECO_LEVELS,
): Promise<EcoImpactSummary> {
  return computeEcoImpact(await aggregateByWasteType(customerId), levels);
}

export async function loadCommunityEcoImpact(
  levels: readonly EcoLevel[] = ECO_LEVELS,
): Promise<EcoImpactSummary> {
  return computeEcoImpact(await aggregateByWasteType(), levels);
}
