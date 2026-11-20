import type { ReactNode } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Copy,
  Eye,
  EyeOff,
  LayoutGrid,
  Leaf,
  ListOrdered,
  Pencil,
  Printer,
  ShieldCheck,
  Tag,
  User,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function WalletHero({
  greeting,
  children,
}: {
  greeting?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="-mx-4 -mt-4 rounded-b-[2rem] bg-primary px-4 pt-2 pb-10 text-primary-foreground transition-colors duration-150 dark:border-b dark:border-border/60 dark:bg-card/75 dark:text-foreground md:m-0 md:max-w-xl md:rounded-none md:bg-transparent md:p-0 md:text-foreground">
      {greeting && (
        <p className="mb-3 text-sm text-primary-foreground/85 md:text-muted-foreground">
          {greeting}
        </p>
      )}
      {children}
    </div>
  );
}

function Decor() {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-14 size-52 rounded-full bg-white/10"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-16 -bottom-24 size-40 rounded-full bg-white/[0.07]"
      />
    </>
  );
}

export function BalanceCard({
  balance,
  accountNumber,
  name,
}: {
  balance: string;
  accountNumber: string;
  name: string;
}) {
  return (
    <div
      data-balance
      className="group/balance relative overflow-hidden rounded-3xl bg-brand-gradient p-5 text-primary-foreground shadow-xl shadow-black/15 ring-1 ring-white/15 print:bg-none print:text-foreground print:shadow-none print:ring-foreground/30"
    >
      <Decor />
      <div className="relative">
        <div className="flex items-center justify-between text-sm text-primary-foreground/85">
          <span>Saldo Tabungan Sampah</span>
          <Leaf className="size-5" />
        </div>
        <div className="mt-1.5 flex items-center gap-2.5">
          <span className="text-[2rem] leading-tight font-extrabold tracking-tight tabular-nums group-data-[hidden=true]/balance:hidden print:inline!">
            {balance}
          </span>
          <span className="hidden text-[2rem] leading-tight font-extrabold tracking-widest group-data-[hidden=true]/balance:inline print:hidden!">
            Rp ••••••
          </span>
          <button
            type="button"
            data-balance-toggle
            aria-label="Tampilkan / sembunyikan saldo"
            className="flex size-8 items-center justify-center rounded-full bg-white/20 active:bg-white/30 print:hidden"
          >
            <Eye className="size-4 group-data-[hidden=true]/balance:hidden" />
            <EyeOff className="hidden size-4 group-data-[hidden=true]/balance:block" />
          </button>
        </div>
        <div className="mt-6 flex items-end justify-between gap-4">
          <div className="shrink-0">
            <div className="text-xs text-primary-foreground/75">
              No. Rekening
            </div>
            <div className="flex items-center gap-1.5 font-bold tracking-wider whitespace-nowrap">
              {accountNumber}
              <button
                type="button"
                data-copy={accountNumber}
                aria-label="Salin nomor rekening"
                className="relative flex size-6 items-center justify-center rounded-md bg-white/20 active:bg-white/30 data-[copied]:after:absolute data-[copied]:after:-top-7 data-[copied]:after:left-1/2 data-[copied]:after:-translate-x-1/2 data-[copied]:after:rounded-md data-[copied]:after:bg-black/75 data-[copied]:after:px-1.5 data-[copied]:after:py-0.5 data-[copied]:after:text-[10px] data-[copied]:after:font-medium data-[copied]:after:tracking-normal data-[copied]:after:whitespace-nowrap data-[copied]:after:content-['Disalin'] print:hidden"
              >
                <Copy className="size-3.5" />
              </button>
            </div>
          </div>
          <div className="min-w-0 truncate text-right text-sm font-bold tracking-wide uppercase">
            {name}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SummaryCard({
  title,
  value,
  stats,
}: {
  title: string;
  value: string;
  stats: { label: string; value: string }[];
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-5 text-primary-foreground shadow-xl shadow-black/15 ring-1 ring-white/15">
      <Decor />
      <div className="relative">
        <div className="flex items-center justify-between text-sm text-primary-foreground/85">
          <span>{title}</span>
          <Leaf className="size-5" />
        </div>
        <div className="mt-1.5 text-[2rem] leading-tight font-extrabold tracking-tight tabular-nums">
          {value}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-white/15 p-3">
          {stats.map((s) => (
            <div key={s.label} className="min-w-0">
              <div className="truncate text-[11px] text-primary-foreground/80">
                {s.label}
              </div>
              <div className="truncate text-sm font-semibold tabular-nums">
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const QUICK_ICONS: Record<string, LucideIcon> = {
  in: ArrowDownToLine,
  out: ArrowUpFromLine,
  "user-plus": UserPlus,
  tag: Tag,
  users: Users,
  list: ListOrdered,
  shield: ShieldCheck,
  grid: LayoutGrid,
  edit: Pencil,
  printer: Printer,
  user: User,
};

const TONES = {
  green: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
  orange:
    "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  purple:
    "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
  teal: "bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400",
} as const;

export type QuickAction = {
  label: string;
  icon: string;
  tone: keyof typeof TONES;
  href?: string;
  print?: boolean;
};

export function QuickActions({
  items,
  overlap = false,
}: {
  items: QuickAction[];
  overlap?: boolean;
}) {
  return (
    <nav
      className={cn(
        "relative mb-5 grid grid-cols-4 gap-y-4 md:max-w-xl rounded-3xl bg-card px-2 py-4 shadow-sm border border-border/75 print:hidden",
        overlap &&
          "-mt-7 shadow-lg shadow-black/5 dark:shadow-black/25 md:mt-4",
      )}
    >
      {items.map((item) => {
        const Icon = QUICK_ICONS[item.icon] ?? LayoutGrid;
        const content = (
          <>
            <span
              className={cn(
                "flex size-12 items-center justify-center rounded-2xl",
                TONES[item.tone],
              )}
            >
              <Icon className="size-[22px]" />
            </span>
            <span className="text-center text-xs leading-tight font-medium">
              {item.label}
            </span>
          </>
        );
        const cls = "flex flex-col items-center gap-1.5 px-1 active:opacity-70";
        return item.print ? (
          <button key={item.label} type="button" data-print className={cls}>
            {content}
          </button>
        ) : (
          <a key={item.label} href={item.href} className={cls}>
            {content}
          </a>
        );
      })}
    </nav>
  );
}
