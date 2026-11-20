import type { ReactNode } from 'react';
import { Ban, Check, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ReceiptData = {
  organizationName: string;
  contact: string;
  footer: string | null;
  isDeposit: boolean;
  amount: string;
  dateTime: string;
  number: string;
  customerName: string;
  accountNumber: string;
  typeLabel: string;
  processedBy: string;
  note: string | null;
  items: { name: string; detail: string; subtotal: string }[];
  balanceAfter: string;
  voided?: { at: string; by: string; reason: string; reversal: { number: string; href: string } | null };
  reversalOf?: { number: string; href: string };
};

function Row({ label, children, strong }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn('text-right font-medium break-words', strong && 'font-bold')}>{children}</dd>
    </div>
  );
}

const Divider = () => <div className="mx-5 border-t border-dashed" />;

export function Receipt({ r }: { r: ReceiptData }) {
  return (
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-foreground/10 print:shadow-none">
      <div className="bg-primary/10 px-5 py-3 text-center text-primary">
        <div className="text-sm font-bold">{r.organizationName}</div>
        {r.contact && <div className="text-xs opacity-80">{r.contact}</div>}
      </div>

      <div className="px-5 pt-6 pb-5 text-center">
        <div
          className={cn(
            'mx-auto mb-3 flex size-16 items-center justify-center rounded-full text-white ring-8',
            r.voided
              ? 'bg-destructive ring-destructive/15'
              : r.reversalOf
                ? 'bg-amber-500 ring-amber-500/15'
                : r.isDeposit
                  ? 'bg-deposit ring-deposit/15'
                  : 'bg-withdrawal ring-withdrawal/15',
          )}
        >
          {r.voided ? <Ban className="size-8" strokeWidth={2.5} /> : r.reversalOf ? <Undo2 className="size-8" strokeWidth={2.5} /> : <Check className="size-8" strokeWidth={3} />}
        </div>
        <div className="font-semibold">
          {r.voided
            ? r.isDeposit
              ? 'Setoran Dibatalkan'
              : 'Penarikan Dibatalkan'
            : r.reversalOf
              ? 'Koreksi Transaksi'
              : r.isDeposit
                ? 'Setoran Sampah Berhasil'
                : 'Penarikan Saldo Berhasil'}
        </div>
        <div className={cn('mt-1 text-3xl font-extrabold tracking-tight tabular-nums', r.voided && 'text-muted-foreground line-through')}>{r.amount}</div>
        <div className="mt-1 text-sm text-muted-foreground">{r.dateTime}</div>
      </div>

      {r.voided && (
        <div className="mx-5 mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <div className="font-semibold">Dibatalkan karena salah input</div>
          <div className="mt-0.5">“{r.voided.reason}”</div>
          <div className="mt-1 text-xs opacity-80">
            Oleh {r.voided.by} · {r.voided.at}
            {r.voided.reversal && (
              <>
                {' · '}
                <a href={r.voided.reversal.href} className="font-semibold underline">
                  Lihat koreksi #{r.voided.reversal.number}
                </a>
              </>
            )}
          </div>
          <div className="mt-1 text-xs opacity-80">Saldo sudah dikembalikan. Transaksi ini tidak dihitung dalam laporan.</div>
        </div>
      )}
      {r.reversalOf && (
        <div className="mx-5 mb-4 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          Membatalkan transaksi{' '}
          <a href={r.reversalOf.href} className="font-semibold underline">
            #{r.reversalOf.number}
          </a>{' '}
          yang salah input.
        </div>
      )}

      <Divider />
      <dl className="px-5 py-3">
        <Row label="No. transaksi">#{r.number}</Row>
        <Row label="Nasabah">{r.customerName}</Row>
        <Row label="No. rekening">{r.accountNumber}</Row>
        <Row label="Jenis">{r.typeLabel}</Row>
        <Row label="Petugas">{r.processedBy}</Row>
        {r.note && <Row label="Catatan">{r.note}</Row>}
      </dl>

      {r.items.length > 0 && (
        <>
          <Divider />
          <div className="px-5 py-3">
            <div className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Rincian sampah</div>
            {r.items.map((i) => (
              <div key={i.name} className="flex justify-between gap-4 py-1.5 text-sm">
                <span>
                  {i.name}
                  <span className="block text-xs text-muted-foreground">{i.detail}</span>
                </span>
                <span className="font-semibold whitespace-nowrap tabular-nums">{i.subtotal}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <Divider />
      <dl className="bg-muted/40 px-5 py-3">
        <Row label={r.isDeposit ? 'Total setoran' : 'Total penarikan'} strong>
          {r.amount}
        </Row>
        <Row label="Saldo akhir" strong>
          {r.balanceAfter}
        </Row>
      </dl>
      {r.footer && <p className="border-t border-dashed px-5 py-3 text-center text-xs whitespace-pre-line text-muted-foreground">{r.footer}</p>}
    </div>
  );
}
