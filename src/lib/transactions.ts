import type { Prisma } from '../generated/prisma/client';
import { prisma } from './prisma';
import { formatRupiah } from './format';
import type { TxActionData } from '../components/views/TxActions';

export const COUNTED: Prisma.TransactionWhereInput = { voidedAt: null, reversalOfId: null };

export type TransactionStatus = 'voided' | 'reversal' | null;

export function transactionStatus(t: { voidedAt: Date | null; reversalOfId: number | null }): TransactionStatus {
  if (t.reversalOfId) return 'reversal';
  if (t.voidedAt) return 'voided';
  return null;
}

export const reversalLabel = (type: 'DEPOSIT' | 'WITHDRAWAL') => (type === 'WITHDRAWAL' ? 'Pembatalan setoran' : 'Pembatalan penarikan');

export const VOID_REASON_MIN = 5;

export class VoidError extends Error {}

type Tx = Prisma.TransactionClient;

const txNumber = (id: number) => String(id).padStart(6, '0');

function checkReason(reason: string) {
  reason = reason.trim().slice(0, 200);
  if (reason.length < VOID_REASON_MIN) throw new VoidError(`Isi alasan (min. ${VOID_REASON_MIN} karakter).`);
  return reason;
}

/**
 * Membatalkan transaksi di dalam prisma.$transaction yang sudah berjalan; mengembalikan transaksi pembalik.
 * Melempar VoidError dengan pesan untuk UI.
 */
export async function reverseTransaction(tx: Tx, id: number, { reason, by }: { reason: string; by: string }) {
  reason = checkReason(reason);
  // Tandai dulu secara bersyarat: aman dari klik ganda / dua petugas membatalkan bersamaan
  const marked = await tx.transaction.updateMany({
    where: { id, voidedAt: null, reversalOfId: null },
    data: { voidedAt: new Date(), voidedBy: by, voidReason: reason },
  });
  const original = await tx.transaction.findUnique({ where: { id } });
  if (!original) throw new VoidError('Transaksi tidak ditemukan.');
  if (marked.count === 0) {
    throw new VoidError(original.reversalOfId ? 'Transaksi koreksi tidak dapat dibatalkan.' : `Transaksi #${txNumber(id)} sudah dibatalkan.`);
  }

  // Kembalikan saldo. Membatalkan setoran = mengurangi saldo, jadi saldo harus masih cukup.
  if (original.type === 'DEPOSIT') {
    const result = await tx.customer.updateMany({
      where: { id: original.customerId, balance: { gte: original.amount } },
      data: { balance: { decrement: original.amount } },
    });
    if (result.count === 0) {
      throw new VoidError(`Saldo nasabah sudah tidak cukup untuk membatalkan setoran #${txNumber(id)} (kemungkinan sudah ditarik).`);
    }
  } else {
    await tx.customer.update({ where: { id: original.customerId }, data: { balance: { increment: original.amount } } });
  }
  const customer = await tx.customer.findUniqueOrThrow({ where: { id: original.customerId } });

  return tx.transaction.create({
    data: {
      customerId: original.customerId,
      type: original.type === 'DEPOSIT' ? 'WITHDRAWAL' : 'DEPOSIT',
      amount: original.amount,
      balanceAfter: customer.balance,
      note: `Koreksi #${txNumber(original.id)}: ${reason}`.slice(0, 255),
      processedBy: by,
      reversalOfId: original.id,
    },
  });
}

/** Membatalkan transaksi (tanpa mencatat pengganti). */
export async function voidTransaction(id: number, opts: { reason: string; by: string }) {
  checkReason(opts.reason);
  return prisma.$transaction((tx) => reverseTransaction(tx, id, opts));
}

/**
 * Transaksi yang akan diperbaiki (?fix=id di form setor/tarik). Perbaikan = batalkan yang lama dan catat yang
 * baru dalam satu transaksi database, jadi kalau form ditinggalkan tidak ada yang berubah.
 */
export async function loadFixTarget(id: number | null, type: 'DEPOSIT' | 'WITHDRAWAL') {
  if (!id) return { target: null, error: '' };
  const target = await prisma.transaction.findUnique({ where: { id }, include: { items: { include: { wasteType: true } } } });
  if (!target) return { target: null, error: 'Transaksi yang akan diperbaiki tidak ditemukan.' };
  if (target.voidedAt) return { target: null, error: `Transaksi #${txNumber(id)} sudah dibatalkan.` };
  if (target.reversalOfId) return { target: null, error: 'Transaksi koreksi tidak dapat diperbaiki.' };
  if (target.type !== type) return { target: null, error: 'Jenis transaksi tidak sesuai.' };
  return { target, error: '' };
}

/** Data tombol aksi (Perbaiki / Batalkan) di daftar riwayat; undefined jika transaksi tidak bisa dikoreksi. */
export function txActions(
  t: { id: number; type: 'DEPOSIT' | 'WITHDRAWAL'; amount: Prisma.Decimal; voidedAt: Date | null; reversalOfId: number | null },
  label: string,
): TxActionData | undefined {
  if (t.voidedAt || t.reversalOfId) return undefined;
  const sign = t.type === 'DEPOSIT' ? '+' : '−';
  return {
    id: t.id,
    number: txNumber(t.id),
    label,
    summary: `${t.type === 'DEPOSIT' ? 'Setoran' : 'Penarikan'} ${sign}${formatRupiah(t.amount)}`,
    isDeposit: t.type === 'DEPOSIT',
    fixHref: `/transactions/${t.type === 'DEPOSIT' ? 'deposit' : 'withdraw'}?fix=${t.id}`,
    detailHref: `/transactions/${t.id}`,
  };
}
