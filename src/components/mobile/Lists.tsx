import type { ReactNode } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronLeft,
  ChevronRight,
  Search,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { StatusBadge, type TransactionStatus } from "../views/shared";
import { TxMenuButton, type TxActionData } from "../views/TxActions";

export type MobileTx = {
  id: number;
  href: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  title: string;
  subtitle: string;
  amount: string;
  time: string;
  balanceAfter?: string;
  status?: TransactionStatus;
  actions?: TxActionData;
};
export type MobileTxGroup = { label: string; items: MobileTx[] };

export function TransactionList({
  groups,
  empty = "Belum ada transaksi.",
}: {
  groups: MobileTxGroup[];
  empty?: string;
}) {
  if (groups.length === 0) return <MobileEmpty>{empty}</MobileEmpty>;
  return (
    <div className="grid gap-4">
      {groups.map((g) => (
        <section key={g.label}>
          <h3 className="mb-1.5 px-1 text-xs font-semibold text-muted-foreground">
            {g.label}
          </h3>
          <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl bg-card shadow-xs border border-border/80">
            {g.items.map((t) => {
              const isDeposit = t.type === "DEPOSIT";
              const Icon = isDeposit ? ArrowDownToLine : ArrowUpFromLine;
              return (
                <li key={t.id} className="flex">
                  <a
                    href={t.href}
                    className={cn(
                      "flex min-w-0 flex-1 items-center gap-3 py-3 pl-3.5 active:bg-muted",
                      t.actions ? "pr-1" : "pr-3.5",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-xl",
                        isDeposit
                          ? "bg-deposit/10 text-deposit"
                          : "bg-withdrawal/10 text-withdrawal",
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="grid min-w-0 flex-1">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate text-sm font-semibold">
                          {t.title}
                        </span>
                        <StatusBadge
                          status={t.status}
                          className="h-4 shrink-0 px-1.5 text-[10px]"
                        />
                      </span>
                      <span className="line-clamp-2 text-xs text-muted-foreground">
                        {t.subtitle}
                      </span>
                      {t.balanceAfter && (
                        <span className="text-[11px] text-muted-foreground">
                          Saldo {t.balanceAfter}
                        </span>
                      )}
                    </span>
                    <span className="flex shrink-0 flex-col items-end">
                      <span
                        className={cn(
                          "text-sm font-bold tabular-nums",
                          isDeposit ? "text-deposit" : "text-withdrawal",
                          t.status === "voided" &&
                            "text-muted-foreground line-through",
                        )}
                      >
                        {isDeposit ? "+" : "−"}
                        {t.amount}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {t.time}
                      </span>
                    </span>
                  </a>
                  {t.actions && <TxMenuButton a={t.actions} />}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

export type MobileListItem = {
  key: string | number;
  href?: string;
  initials?: string;
  icon?: "tag";
  title: string;
  subtitle?: ReactNode;
  right?: string;
  rightSub?: string;
  dimmed?: boolean;
};

const ITEM_ICONS: Record<string, LucideIcon> = { tag: Tag };

export function MobileList({
  items,
  empty,
}: {
  items: MobileListItem[];
  empty: string;
}) {
  if (items.length === 0) return <MobileEmpty>{empty}</MobileEmpty>;
  return (
    <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl bg-card shadow-xs border border-border/80">
      {items.map((i) => {
        const Icon = i.icon ? ITEM_ICONS[i.icon] : undefined;
        const body = (
          <>
            {Icon ? (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
            ) : (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {i.initials}
              </span>
            )}
            <span
              className={cn("grid min-w-0 flex-1", i.dimmed && "opacity-60")}
            >
              <span className="truncate text-sm font-semibold">{i.title}</span>
              {i.subtitle && (
                <span className="truncate text-xs text-muted-foreground">
                  {i.subtitle}
                </span>
              )}
            </span>
            {i.right && (
              <span className="flex shrink-0 flex-col items-end">
                <span className="text-sm font-bold tabular-nums">
                  {i.right}
                </span>
                {i.rightSub && (
                  <span className="text-[11px] text-muted-foreground">
                    {i.rightSub}
                  </span>
                )}
              </span>
            )}
            {i.href && (
              <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" />
            )}
          </>
        );
        return (
          <li key={i.key}>
            {i.href ? (
              <a
                href={i.href}
                className="flex items-center gap-3 px-3.5 py-3 active:bg-muted"
              >
                {body}
              </a>
            ) : (
              <div className="flex items-center gap-3 px-3.5 py-3">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function MobileEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed bg-card/60 px-4 py-10 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  href,
  linkLabel = "Lihat semua",
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mt-6 mb-2 flex items-baseline justify-between gap-4 px-1">
      <h2 className="text-base font-semibold">{title}</h2>
      {href && (
        <a href={href} className="text-sm font-semibold text-primary">
          {linkLabel}
        </a>
      )}
    </div>
  );
}

export function MobileSearch({
  q,
  placeholder,
  hidden,
}: {
  q: string;
  placeholder: string;
  hidden?: Record<string, string>;
}) {
  return (
    <form method="get" className="relative mb-3">
      {hidden &&
        Object.entries(hidden).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-11 rounded-full bg-card pl-10 shadow-sm"
      />
    </form>
  );
}

export function FilterChips({
  items,
}: {
  items: { label: string; href: string; active: boolean }[];
}) {
  return (
    <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
      {items.map((c) => (
        <a
          key={c.label}
          href={c.href}
          data-partial
          className={cn(
            "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap",
            c.active
              ? "border-primary bg-primary text-primary-foreground"
              : "bg-card text-foreground",
          )}
        >
          {c.label}
        </a>
      ))}
    </div>
  );
}

export function MobilePager({
  page,
  totalPages,
  total,
  prevHref,
  nextHref,
}: {
  page: number;
  totalPages: number;
  total?: number;
  prevHref?: string;
  nextHref?: string;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav
      aria-label="Navigasi halaman"
      className="mt-4 flex items-center justify-between gap-2 print:hidden"
    >
      {prevHref ? (
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <a href={prevHref} data-partial>
            <ChevronLeft /> Sebelumnya
          </a>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled className="rounded-full">
          <ChevronLeft /> Sebelumnya
        </Button>
      )}
      <span className="text-xs text-muted-foreground tabular-nums">
        Hal. {page} / {totalPages}
        {total !== undefined ? ` · ${total}` : ""}
      </span>
      {nextHref ? (
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <a href={nextHref} data-partial>
            Berikutnya <ChevronRight />
          </a>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled className="rounded-full">
          Berikutnya <ChevronRight />
        </Button>
      )}
    </nav>
  );
}
export function Fab({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 flex size-14 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground shadow-lg shadow-primary/35 md:hidden print:hidden"
    >
      {children}
    </a>
  );
}
