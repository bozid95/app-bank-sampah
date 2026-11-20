import { Printer, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { TxActionButtons, type TxActionData } from "./TxActions";
import {
  EmptyState,
  Pagination,
  SignedAmount,
  StatusBadge,
  TypeBadge,
  type PaginationProps,
  type TransactionKind,
  type TransactionStatus,
} from "./shared";
import type { MonthOption } from "@/lib/period";

export type TransactionRow = {
  id: number;
  number: string;
  date: string;
  customerId: number;
  customerName: string;
  accountNumber: string;
  type: TransactionKind;
  amount: string;
  processedBy: string;
  note: string | null;
  status: TransactionStatus;
  actions?: TxActionData;
};

type Filter = { label: string; href: string; active: boolean };

export function TransactionsPanel({
  rows,
  q,
  type,
  month = "",
  monthOptions = [],
  filters,
  pagination,
}: {
  rows: TransactionRow[];
  q: string;
  type: TransactionKind | "";
  month?: string;
  monthOptions?: MonthOption[];
  filters: Filter[];
  pagination: PaginationProps;
}) {
  return (
    <Card className="gap-0 py-0">
      <div className="flex flex-wrap items-center gap-3 border-b p-4">
        <nav
          className="inline-flex rounded-lg bg-muted p-[3px]"
          aria-label="Filter tipe"
        >
          {filters.map((f) => (
            <a
              key={f.label}
              href={f.href}
              data-partial
              className={cn(
                "rounded-md px-3 py-1 text-sm font-medium text-muted-foreground transition-colors",
                f.active
                  ? "bg-background text-foreground shadow-sm"
                  : "hover:text-foreground",
              )}
            >
              {f.label}
            </a>
          ))}
        </nav>
        <form
          method="get"
          className="ml-auto flex flex-wrap items-center gap-2"
        >
          {type && <input type="hidden" name="type" value={type} />}
          {monthOptions.length > 0 && (
            <NativeSelect
              name="month"
              defaultValue={month}
              data-auto-submit
              aria-label="Filter bulan"
              className="h-9 text-sm"
            >
              <NativeSelectOption value="">Semua periode</NativeSelectOption>
              {monthOptions.map((m) => (
                <NativeSelectOption key={m.value} value={m.value}>
                  {m.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          )}
          <div className="relative w-60">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Cari nama / no. rekening"
              className="pl-8"
              aria-label="Cari transaksi"
            />
          </div>
          <Button type="submit" variant="outline">
            Cari
          </Button>
          <Button
            type="button"
            variant="outline"
            data-print
            className="print:hidden"
          >
            <Printer /> Cetak laporan
          </Button>
        </form>
      </div>

      {rows.length === 0 ? (
        <EmptyState>Tidak ada transaksi.</EmptyState>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="pl-4">No.</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Nasabah</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Petugas</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              <TableHead className="w-0 pr-4 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="pl-4 font-mono text-xs">
                  <a href={`/transactions/${t.id}`} className="hover:underline">
                    #{t.number}
                  </a>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {t.date}
                </TableCell>
                <TableCell>
                  <a
                    href={`/customers/${t.customerId}`}
                    className="font-medium hover:underline"
                  >
                    {t.customerName}
                  </a>
                  <div className="text-xs text-muted-foreground">
                    {t.accountNumber}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <TypeBadge type={t.type} />
                    <StatusBadge status={t.status} />
                  </div>
                  {t.note && (
                    <div className="mt-1 max-w-48 truncate text-xs text-muted-foreground">
                      {t.note}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {t.processedBy}
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className={cn(
                      t.status === "voided" && "line-through opacity-60",
                    )}
                  >
                    <SignedAmount type={t.type}>{t.amount}</SignedAmount>
                  </span>
                </TableCell>
                <TableCell className="pr-4">
                  {t.actions && <TxActionButtons a={t.actions} />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Pagination {...pagination} />
    </Card>
  );
}
