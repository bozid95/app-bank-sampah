import type { Prisma } from '../generated/prisma/client';
import type { ReceiptData } from '../components/views/Receipt';
import { getTimezone, type AppConfigData } from './config';
import { formatDateTime, formatKg, formatRupiah, transactionLabel } from './format';

type TransactionWithDetails = Prisma.TransactionGetPayload<{
  include: { customer: true; items: { include: { wasteType: true } }; reversal: { select: { id: true } } };
}>;

export const RECEIPT_INCLUDE = {
  customer: true,
  items: { include: { wasteType: true } },
  reversal: { select: { id: true } },
} as const;

const txNumber = (id: number) => String(id).padStart(6, '0');

export function receiptData(t: TransactionWithDetails, config: AppConfigData, hrefBase = '/transactions/'): ReceiptData {
  const tz = getTimezone(config.timezone).short;
  return {
    organizationName: config.organizationName,
    contact: [config.address, config.phone, config.email].filter(Boolean).join(' · '),
    footer: config.receiptFooter,
    isDeposit: t.type === 'DEPOSIT',
    amount: formatRupiah(t.amount),
    dateTime: `${formatDateTime(t.createdAt)} ${tz}`,
    number: txNumber(t.id),
    customerName: t.customer.name,
    accountNumber: t.customer.accountNumber,
    typeLabel: transactionLabel(t.type),
    processedBy: t.processedBy,
    note: t.note,
    items: t.items.map((i) => ({
      name: i.wasteType.name,
      detail: `${formatKg(i.weightKg)} × ${formatRupiah(i.pricePerKg)}/kg`,
      subtotal: formatRupiah(i.subtotal),
    })),
    balanceAfter: formatRupiah(t.balanceAfter),
    voided: t.voidedAt
      ? {
          at: `${formatDateTime(t.voidedAt)} ${tz}`,
          by: t.voidedBy ?? '-',
          reason: t.voidReason ?? '-',
          reversal: t.reversal ? { number: txNumber(t.reversal.id), href: `${hrefBase}${t.reversal.id}` } : null,
        }
      : undefined,
    reversalOf: t.reversalOfId ? { number: txNumber(t.reversalOfId), href: `${hrefBase}${t.reversalOfId}` } : undefined,
  };
}
