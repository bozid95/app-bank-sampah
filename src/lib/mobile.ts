import type { Prisma } from '../generated/prisma/client';
import { formatDay, formatKg, formatRupiah, formatTime, transactionLabel } from './format';
import type { MobileTxGroup } from '../components/mobile/Lists';
import { reversalLabel, transactionStatus, txActions } from './transactions';

type TxInput = {
  id: number;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: Prisma.Decimal;
  balanceAfter: Prisma.Decimal;
  note: string | null;
  createdAt: Date;
  voidedAt: Date | null;
  reversalOfId: number | null;
  customer?: { name: string; accountNumber: string };
  items?: { weightKg: Prisma.Decimal; wasteType: { name: string } }[];
};

export function groupTransactions(
  rows: TxInput[],
  {
    mode,
    hrefBase,
    showBalance = false,
    actions = false,
  }: { mode: 'admin' | 'customer'; hrefBase: string; showBalance?: boolean;  actions?: boolean },
): MobileTxGroup[] {
  const today = formatDay(new Date());
  const yesterday = formatDay(new Date(Date.now() - 86_400_000));
  const groups: MobileTxGroup[] = [];

  for (const t of rows) {
    const day = formatDay(t.createdAt);
    const label = day === today ? 'Hari ini' : day === yesterday ? 'Kemarin' : day;
    const status = transactionStatus(t);
    const subtitle =
      status === 'reversal'
        ? (t.note ?? 'Koreksi transaksi')
        : mode === 'admin'
        ? `${transactionLabel(t.type)} · ${t.customer?.accountNumber ?? ''}`
        : t.type === 'DEPOSIT' && t.items?.length
          ? t.items.map((i) => `${i.wasteType.name} ${formatKg(i.weightKg)}`).join(', ')
          : t.note || (t.type === 'DEPOSIT' ? 'Setoran' : 'Penarikan tunai');
    const item = {
      id: t.id,
      href: `${hrefBase}${t.id}`,
      type: t.type,
      title: mode === 'admin' && t.customer ? t.customer.name : status === 'reversal' ? reversalLabel(t.type) : transactionLabel(t.type),
      subtitle,
      amount: formatRupiah(t.amount),
      time: formatTime(t.createdAt),
      balanceAfter: showBalance ? formatRupiah(t.balanceAfter) : undefined,
      status,
      actions: actions ? txActions(t, t.customer?.name ?? transactionLabel(t.type)) : undefined,
    };
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(item);
    else groups.push({ label, items: [item] });
  }
  return groups;
}
