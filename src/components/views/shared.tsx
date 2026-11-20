import type { ReactNode } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PageItem } from "@/lib/pagination";

export type TransactionKind = "DEPOSIT" | "WITHDRAWAL";

export function TypeBadge({ type }: { type: TransactionKind }) {
  return type === "DEPOSIT" ? (
    <Badge
      variant="outline"
      className="gap-1 border-deposit/30 bg-deposit/10 text-deposit"
    >
      <ArrowDownToLine /> Setor
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="gap-1 border-withdrawal/30 bg-withdrawal/10 text-withdrawal"
    >
      <ArrowUpFromLine /> Tarik
    </Badge>
  );
}

export function SignedAmount({
  type,
  children,
}: {
  type: TransactionKind;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        type === "DEPOSIT" ? "text-deposit" : "text-withdrawal",
      )}
    >
      {type === "DEPOSIT" ? "+" : "−"}
      {children}
    </span>
  );
}

export type TransactionStatus = "voided" | "reversal" | null;

export function StatusBadge({
  status,
  className,
}: {
  status: TransactionStatus | undefined;
  className?: string;
}) {
  if (status === "voided")
    return (
      <Badge
        variant="outline"
        className={cn(
          "border-destructive/30 bg-destructive/10 text-destructive",
          className,
        )}
      >
        Dibatalkan
      </Badge>
    );
  if (status === "reversal")
    return (
      <Badge
        variant="outline"
        className={cn(
          "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
          className,
        )}
      >
        Koreksi
      </Badge>
    );
  return null;
}

export function InitialsAvatar({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary",
        className,
      )}
    >
      {text}
    </span>
  );
}

export type PaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
  prevHref?: string;
  nextHref?: string;
  items: PageItem[];
};

export function Pagination({
  page,
  totalPages,
  total,
  from,
  to,
  prevHref,
  nextHref,
  items,
}: PaginationProps) {
  return (
    <nav
      aria-label="Navigasi halaman"
      className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm text-muted-foreground print:hidden"
    >
      <span className="tabular-nums">
        {total === 0 ? (
          "0 data"
        ) : (
          <>
            Menampilkan{" "}
            <strong className="font-medium text-foreground">
              {from}–{to}
            </strong>{" "}
            dari{" "}
            <strong className="font-medium text-foreground">{total}</strong>{" "}
            data
          </>
        )}
      </span>
      <div className="flex items-center gap-1">
        {prevHref ? (
          <Button asChild variant="outline" size="sm">
            <a href={prevHref} data-partial aria-label="Halaman sebelumnya">
              <ChevronLeft />{" "}
              <span className="hidden sm:inline">Sebelumnya</span>
            </a>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft /> <span className="hidden sm:inline">Sebelumnya</span>
          </Button>
        )}

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {items.map((item) =>
              item.type === "ellipsis" ? (
                <span
                  key={item.key}
                  className="flex size-8 items-center justify-center text-muted-foreground"
                  aria-hidden="true"
                >
                  <MoreHorizontal className="size-4" />
                </span>
              ) : item.active ? (
                <Button
                  key={item.page}
                  size="sm"
                  className="min-w-8 px-2 tabular-nums"
                  aria-current="page"
                >
                  {item.page}
                </Button>
              ) : (
                <Button
                  key={item.page}
                  asChild
                  variant="outline"
                  size="sm"
                  className="min-w-8 px-2 tabular-nums"
                >
                  <a
                    href={item.href}
                    data-partial
                    aria-label={`Halaman ${item.page}`}
                  >
                    {item.page}
                  </a>
                </Button>
              ),
            )}
          </div>
        )}

        {nextHref ? (
          <Button asChild variant="outline" size="sm">
            <a href={nextHref} data-partial aria-label="Halaman berikutnya">
              <span className="hidden sm:inline">Berikutnya</span>{" "}
              <ChevronRight />
            </a>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled
            aria-label="Halaman berikutnya"
          >
            <span className="hidden sm:inline">Berikutnya</span>{" "}
            <ChevronRight />
          </Button>
        )}
      </div>
    </nav>
  );
}

/** Baris kosong di tabel */
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 py-12 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
