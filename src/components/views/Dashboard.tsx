import {
  ArrowDownToLine,
  Scale,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  InitialsAvatar,
  SignedAmount,
  StatusBadge,
  TypeBadge,
  type TransactionKind,
  type TransactionStatus,
} from "./shared";

export type DashboardStats = {
  totalBalance: string;
  customerCount: number;
  newCustomersThisMonth: number;
  monthWeight: string;
  monthDepositCount: number;
  monthDeposits: string;
  monthWithdrawals: string;
};

function StatCard({
  title,
  value,
  note,
  icon: Icon,
}: {
  title: string;
  value: string;
  note: string;
  icon: LucideIcon;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums">
          {value}
        </CardTitle>
        <CardAction>
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4.5" />
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">
        {note}
      </CardContent>
    </Card>
  );
}

export function StatCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total saldo nasabah"
        value={stats.totalBalance}
        note="Dana yang harus siap untuk penarikan"
        icon={Wallet}
      />
      <StatCard
        title="Jumlah nasabah"
        value={String(stats.customerCount)}
        note={
          stats.newCustomersThisMonth > 0
            ? `+${stats.newCustomersThisMonth} nasabah baru bulan ini`
            : "Belum ada nasabah baru bulan ini"
        }
        icon={Users}
      />
      <StatCard
        title="Sampah masuk bulan ini"
        value={stats.monthWeight}
        note={`Dari ${stats.monthDepositCount} kali setoran`}
        icon={Scale}
      />
      <StatCard
        title="Nilai setoran bulan ini"
        value={stats.monthDeposits}
        note={`Penarikan bulan ini: ${stats.monthWithdrawals}`}
        icon={ArrowDownToLine}
      />
    </div>
  );
}

export type WasteShare = { name: string; weight: string; percent: number };

export function WasteCompositionCard({ items }: { items: WasteShare[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Komposisi sampah</CardTitle>
        <CardDescription>Berat per jenis, bulan ini</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {items.length === 0 && (
          <EmptyState>Belum ada setoran bulan ini.</EmptyState>
        )}
        {items.map((i) => (
          <div key={i.name} className="grid gap-1.5">
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="truncate font-medium">{i.name}</span>
              <span className="shrink-0 text-muted-foreground tabular-nums">
                {i.weight} · {i.percent}%
              </span>
            </div>
            <Progress value={i.percent} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export type RecentTransaction = {
  id: number;
  date: string;
  customerId: number;
  customerName: string;
  accountNumber: string;
  type: TransactionKind;
  amount: string;
  status: TransactionStatus;
  actions?: TxActionData;
};

export function RecentTransactionsCard({
  rows,
}: {
  rows: RecentTransaction[];
}) {
  return (
    <Card className="h-full gap-0 pb-0">
      <CardHeader className="pb-4">
        <CardTitle>Transaksi terbaru</CardTitle>
        <CardDescription>Setoran dan penarikan terakhir</CardDescription>
        <CardAction>
          <Button asChild variant="outline" size="sm">
            <a href="/transactions">Lihat semua</a>
          </Button>
        </CardAction>
      </CardHeader>
      {rows.length === 0 ? (
        <EmptyState>Belum ada transaksi.</EmptyState>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="pl-4">Nasabah</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Waktu</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              <TableHead className="w-0 pr-4 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="pl-4">
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
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <a href={`/transactions/${t.id}`} className="hover:underline">
                    {t.date}
                  </a>
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
    </Card>
  );
}

export type TopCustomer = {
  id: number;
  name: string;
  initials: string;
  accountNumber: string;
  balance: string;
};

export function TopCustomersCard({ rows }: { rows: TopCustomer[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Saldo terbesar</CardTitle>
        <CardDescription>Nasabah dengan tabungan tertinggi</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {rows.length === 0 && <EmptyState>Belum ada nasabah.</EmptyState>}
        {rows.map((c) => (
          <a
            key={c.id}
            href={`/customers/${c.id}`}
            className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted"
          >
            <InitialsAvatar text={c.initials} />
            <div className="grid min-w-0 flex-1 leading-tight">
              <span className="truncate text-sm font-medium">{c.name}</span>
              <span className="text-xs text-muted-foreground">
                {c.accountNumber}
              </span>
            </div>
            <span className="text-sm font-medium tabular-nums">
              {c.balance}
            </span>
          </a>
        ))}
      </CardContent>
    </Card>
  );
}
