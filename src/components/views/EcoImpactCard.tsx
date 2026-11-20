import {
  Award,
  Bike,
  ChevronDown,
  CloudOff,
  Leaf,
  Sparkles,
  TreePine,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { EcoImpactSummary, EcoLevel, EcoLevelTone } from "@/lib/ecoImpact";

const TONE_BADGE: Record<EcoLevelTone, string> = {
  emerald:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  teal: "border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-400",
  sky: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  amber:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  violet:
    "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400",
};

const TONE_ICON: Record<EcoLevelTone, string> = {
  emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  teal: "bg-teal-500/15 text-teal-700 dark:text-teal-400",
  sky: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  violet: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
};

export function EcoLevelBadge({
  level,
  className,
}: {
  level: EcoLevel;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 font-medium", TONE_BADGE[level.tone], className)}
    >
      <Award className="size-3.5" />
      Lv. {level.level} · {level.name}
    </Badge>
  );
}

export function EcoImpactCard({ impact }: { impact: EcoImpactSummary }) {
  const { currentLevel, nextLevel } = impact;
  const hasWeight = impact.totalKg > 0;

  return (
    <Card className="mt-4 overflow-hidden rounded-2xl py-0 shadow-sm ring-1 ring-foreground/5 md:rounded-xl">
      <CardContent className="grid gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl",
                TONE_ICON[currentLevel.tone],
              )}
            >
              {currentLevel.level >= 5 ? (
                <Sparkles className="size-4.5" />
              ) : (
                <Award className="size-4.5" />
              )}
            </span>
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <span className="truncate text-sm font-semibold">
                {currentLevel.name}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "h-5 px-1.5 text-[10px]",
                  TONE_BADGE[currentLevel.tone],
                )}
              >
                Lv. {currentLevel.level}
              </Badge>
            </div>
          </div>
          <span className="shrink-0 text-sm font-bold text-primary tabular-nums">
            {impact.totalKgLabel}
          </span>
        </div>

        <div className="grid gap-1.5">
          <Progress value={impact.progressPercent} />
          <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
            {nextLevel ? (
              <>
                <span className="truncate">Menuju {nextLevel.name}</span>
                <span className="shrink-0 font-medium text-primary tabular-nums">
                  {impact.remainingKgLabel} lagi
                </span>
              </>
            ) : (
              <span className="font-medium text-primary">
                Level tertinggi tercapai!
              </span>
            )}
          </div>
        </div>

        {hasWeight ? (
          <>
            <div className="grid grid-cols-3 divide-x rounded-xl bg-muted/40 py-2.5 text-center">
              <div className="px-1.5">
                <div className="flex items-center justify-center gap-1 text-xs font-bold tabular-nums">
                  <CloudOff className="size-3.5 text-primary" />
                  {impact.co2Label}
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">
                  CO₂ dicegah
                </div>
              </div>
              <div className="px-1.5">
                <div className="flex items-center justify-center gap-1 text-xs font-bold tabular-nums">
                  <Bike className="size-3.5 text-primary" />
                  {impact.motorKmLabel}
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">
                  Emisi motor
                </div>
              </div>
              <div className="px-1.5">
                <div className="flex items-center justify-center gap-1 text-xs font-bold tabular-nums">
                  <TreePine className="size-3.5 text-primary" />
                  {impact.treesLabel}
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">
                  Serapan/thn
                </div>
              </div>
            </div>

            <details className="group text-xs text-muted-foreground">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-[11px] font-medium text-primary select-none [&::-webkit-details-marker]:hidden">
                <span>Lihat fakta dampakmu</span>
                <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-2 space-y-1.5 border-t pt-2 leading-relaxed">
                <p className="text-foreground">
                  {currentLevel.tagline} Kamu telah menyelamatkan{" "}
                  <strong className="font-semibold text-primary">
                    {impact.totalKgLabel}
                  </strong>{" "}
                  sampah agar tidak menumpuk di TPA, setara mencegah{" "}
                  <strong className="font-semibold">
                    {impact.co2Label} CO₂
                  </strong>{" "}
                  masuk ke atmosfer.
                </p>
                <p className="text-[10.5px] text-muted-foreground">
                  Estimasi berdasarkan faktor daur ulang EPA WARM &amp;
                  rata-rata serapan karbon pohon dewasa (~21 kg CO₂/tahun).
                </p>
              </div>
            </details>
          </>
        ) : (
          <p className="text-xs leading-relaxed text-muted-foreground">
            Mulai setor sampah pertamamu untuk naik level dan lihat kontribusi
            nyatamu menjaga bumi.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function CommunityImpactBanner({
  impact,
  organizationName,
}: {
  impact: EcoImpactSummary;
  organizationName: string;
}) {
  return (
    <Card className="border-primary/20 bg-primary/[0.03] py-0">
      <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center md:gap-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Leaf className="size-4.5" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">
              Dampak Lingkungan {organizationName}
            </div>
            <p className="text-xs text-muted-foreground">
              {impact.totalKg > 0 ? (
                <>
                  Total{" "}
                  <strong className="font-semibold text-foreground">
                    {impact.totalKgLabel}
                  </strong>{" "}
                  sampah diselamatkan dari TPA.
                </>
              ) : (
                "Dampak pengurangan CO₂ dihitung otomatis dari setiap setoran."
              )}
            </p>
          </div>
        </div>
        {impact.totalKg > 0 && (
          <div className="grid grid-cols-3 divide-x rounded-xl bg-background/80 py-2 text-center ring-1 ring-border md:flex md:divide-x-0 md:gap-5 md:bg-transparent md:py-0 md:text-right md:ring-0">
            <div className="px-2 md:px-0">
              <div className="text-xs font-bold text-primary tabular-nums md:text-sm">
                {impact.co2Label}
              </div>
              <div className="text-[10px] text-muted-foreground md:text-[11px]">
                CO₂ dicegah
              </div>
            </div>
            <div className="px-2 md:px-0">
              <div className="text-xs font-bold tabular-nums md:text-sm">
                {impact.motorKmLabel}
              </div>
              <div className="text-[10px] text-muted-foreground md:text-[11px]">
                Emisi motor
              </div>
            </div>
            <div className="px-2 md:px-0">
              <div className="text-xs font-bold tabular-nums md:text-sm">
                {impact.treesLabel}
              </div>
              <div className="text-[10px] text-muted-foreground md:text-[11px]">
                Pohon/thn
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
