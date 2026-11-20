import {
  BookOpen,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Printer,
  Search,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import type { MonthOption } from "@/lib/period";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TxActionButtons, type TxActionData } from "./TxActions";
import { EcoLevelBadge } from "./EcoImpactCard";
import {
  EmptyState,
  InitialsAvatar,
  Pagination,
  SignedAmount,
  StatusBadge,
  TypeBadge,
  type PaginationProps,
  type TransactionKind,
  type TransactionStatus,
} from "./shared";
import type { EcoLevel } from "@/lib/ecoImpact";

export type CustomerRow = {
  id: number;
  name: string;
  initials: string;
  accountNumber: string;
  phone: string | null;
  address: string | null;
  balance: string;
  hasAccount: boolean;
};

export function CustomersPanel({
  rows,
  q,
  pagination,
}: {
  rows: CustomerRow[];
  q: string;
  pagination: PaginationProps;
}) {
  return (
    <Card className="gap-0 py-0">
      <form method="get" className="flex items-center gap-2 border-b p-4">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Cari nama, no. rekening, telepon"
            className="pl-8"
            aria-label="Cari nasabah"
          />
        </div>
        <Button type="submit" variant="outline">
          Cari
        </Button>
        <Button asChild className="ml-auto">
          <a href="/customers/new">
            <Plus /> Tambah nasabah
          </a>
        </Button>
      </form>

      {rows.length === 0 ? (
        <EmptyState>
          {q
            ? `Tidak ada nasabah yang cocok dengan “${q}”.`
            : "Belum ada nasabah."}
        </EmptyState>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="pl-4">Nasabah</TableHead>
              <TableHead>No. rekening</TableHead>
              <TableHead>Kontak</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead className="w-0 pr-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="pl-4">
                  <a
                    href={`/customers/${c.id}`}
                    className="flex items-center gap-3"
                  >
                    <InitialsAvatar text={c.initials} />
                    <span className="grid leading-tight">
                      <span className="font-medium hover:underline">
                        {c.name}
                      </span>
                      {c.hasAccount && (
                        <span className="text-xs text-muted-foreground">
                          Punya akun aplikasi
                        </span>
                      )}
                    </span>
                  </a>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {c.accountNumber}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <div>{c.phone || "-"}</div>
                  {c.address && (
                    <div className="max-w-56 truncate text-xs">{c.address}</div>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {c.balance}
                </TableCell>
                <TableCell className="pr-4">
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="sm">
                      <a href={`/customers/${c.id}`}>
                        <BookOpen /> Buku
                      </a>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <a href={`/customers/${c.id}/edit`}>
                        <Pencil /> Edit
                      </a>
                    </Button>
                  </div>
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

export type CustomerProfile = {
  id: number;
  name: string;
  initials: string;
  accountNumber: string;
  address: string | null;
  phone: string | null;
  balance: string;
  joinedAt: string;
  totalDeposits: string;
  totalWithdrawals: string;
  totalWeight: string;
  ecoLevel?: EcoLevel;
  co2SavedLabel?: string;
};

export function CustomerProfileCard({
  c,
  admin = false,
}: {
  c: CustomerProfile;
  admin?: boolean;
}) {
  return (
    <Card>
      <CardContent className="grid gap-6 lg:grid-cols-[1fr_auto]">
        <div className="flex items-start gap-4">
          <InitialsAvatar text={c.initials} className="size-14 text-lg" />
          <div className="grid gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-lg font-semibold">{c.name}</div>
              {c.ecoLevel && <EcoLevelBadge level={c.ecoLevel} />}
            </div>
            <div className="font-mono text-sm text-muted-foreground">
              {c.accountNumber}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />{" "}
                {c.address || "Alamat belum diisi"}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="size-3.5" />{" "}
                {c.phone || "Telepon belum diisi"}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Terdaftar {c.joinedAt}
            </div>
          </div>
        </div>
        <div className="grid gap-3 lg:text-right">
          <div>
            <div className="text-sm text-muted-foreground">Saldo saat ini</div>
            <div className="text-3xl font-semibold tracking-tight tabular-nums">
              {c.balance}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end print:hidden">
            {admin && (
              <>
                <Button asChild size="sm">
                  <a href={`/transactions/deposit?customer=${c.id}`}>
                    <ArrowDownToLine /> Setor
                  </a>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href={`/transactions/withdraw?customer=${c.id}`}>
                    <ArrowUpFromLine /> Tarik
                  </a>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href={`/customers/${c.id}/edit`}>
                    <Pencil /> Edit
                  </a>
                </Button>
              </>
            )}
            <Button size="sm" variant="outline" data-print>
              <Printer /> {admin ? "Cetak" : "Cetak buku tabungan"}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardContent className="grid grid-cols-3 gap-4 border-t pt-4 text-sm">
        <div>
          <div className="text-muted-foreground">Total setoran</div>
          <div className="font-medium tabular-nums">{c.totalDeposits}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Total penarikan</div>
          <div className="font-medium tabular-nums">{c.totalWithdrawals}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Total sampah</div>
          <div className="font-medium tabular-nums">
            {c.totalWeight}
            {c.co2SavedLabel && (
              <span className="ml-1.5 text-xs font-normal text-primary">
                · {c.co2SavedLabel} CO₂ dicegah
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export type PassbookRow = {
  id: number;
  date: string;
  type: TransactionKind;
  description: string;
  note: string | null;
  amount: string;
  balanceAfter: string;
  status: TransactionStatus;
  actions?: TxActionData;
};

export function PassbookTable({
  rows,
  hrefBase,
  pagination,
  admin = false,
  month = "",
  monthOptions = [],
}: {
  rows: PassbookRow[];
  hrefBase: string;
  pagination: PaginationProps;
  admin?: boolean;
  month?: string;
  monthOptions?: MonthOption[];
}) {
  return (
    <Card className="gap-0 py-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <div className="font-medium">Riwayat mutasi</div>
          <div className="text-sm text-muted-foreground">
            Setiap setoran dan penarikan beserta saldo setelahnya
          </div>
        </div>
        {monthOptions.length > 0 && (
          <form method="get" className="flex items-center gap-2 print:hidden">
            <NativeSelect
              name="month"
              defaultValue={month}
              data-auto-submit
              aria-label="Filter bulan"
              className="h-8 text-sm"
            >
              <NativeSelectOption value="">Semua periode</NativeSelectOption>
              {monthOptions.map((m) => (
                <NativeSelectOption key={m.value} value={m.value}>
                  {m.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </form>
        )}
      </div>
      {rows.length === 0 ? (
        <EmptyState>
          {month
            ? "Tidak ada transaksi pada bulan ini."
            : "Belum ada transaksi."}
        </EmptyState>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="pl-4">Tanggal</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="text-right">Debit (tarik)</TableHead>
              <TableHead className="text-right">Kredit (setor)</TableHead>
              <TableHead className={admin ? "text-right" : "pr-4 text-right"}>
                Saldo
              </TableHead>
              {admin && (
                <TableHead className="w-0 pr-4 text-right print:hidden">
                  Aksi
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="pl-4 text-muted-foreground">
                  <a href={`${hrefBase}${t.id}`} className="hover:underline">
                    {t.date}
                  </a>
                </TableCell>
                <TableCell className="max-w-md whitespace-normal">
                  <div className="flex items-start gap-2">
                    <TypeBadge type={t.type} />
                    <StatusBadge status={t.status} />
                    <span
                      className={
                        t.status === "voided"
                          ? "text-muted-foreground line-through"
                          : undefined
                      }
                    >
                      {t.description}
                    </span>
                  </div>
                  {t.note && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {t.note}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {t.type === "WITHDRAWAL" && (
                    <SignedAmount type={t.type}>{t.amount}</SignedAmount>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {t.type === "DEPOSIT" && (
                    <SignedAmount type={t.type}>{t.amount}</SignedAmount>
                  )}
                </TableCell>
                <TableCell
                  className={
                    admin
                      ? "text-right font-medium tabular-nums"
                      : "pr-4 text-right font-medium tabular-nums"
                  }
                >
                  {t.balanceAfter}
                </TableCell>
                {admin && (
                  <TableCell className="pr-4 print:hidden">
                    {t.actions && <TxActionButtons a={t.actions} />}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Pagination {...pagination} />
    </Card>
  );
}
