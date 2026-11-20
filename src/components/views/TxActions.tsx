import { Eye, MoreVertical, Pencil, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from './forms';

export type TxActionData = {
  id: number;
  number: string;
  label: string;
  summary: string;
  isDeposit: boolean;
  fixHref: string;
  detailHref: string;
};

const dataAttrs = (a: TxActionData) => ({
  'data-id': a.id,
  'data-number': a.number,
  'data-label': a.label,
  'data-summary': a.summary,
  'data-deposit': a.isDeposit ? '1' : '0',
  'data-fix-href': a.fixHref,
  'data-detail-href': a.detailHref,
});

export function TxActionButtons({ a }: { a: TxActionData }) {
  return (
    <div className="flex justify-end gap-1 print:hidden">
      <Button asChild variant="ghost" size="sm">
        <a href={a.fixHref} title={`Perbaiki transaksi #${a.number}`}>
          <Pencil /> Perbaiki
        </a>
      </Button>
      <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" data-tx-void {...dataAttrs(a)}>
        <Undo2 /> Batalkan
      </Button>
    </div>
  );
}

/** Tombol ⋮ di daftar ponsel: membuka lembar menu */
export function TxMenuButton({ a }: { a: TxActionData }) {
  return (
    <button
      type="button"
      data-tx-menu
      {...dataAttrs(a)}
      aria-label={`Aksi transaksi #${a.number}`}
      className="flex w-9 shrink-0 items-center justify-center self-stretch text-muted-foreground active:bg-muted print:hidden"
    >
      <MoreVertical className="size-5" />
    </button>
  );
}

const sheetClass =
  'm-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-card text-card-foreground shadow-xl backdrop:bg-black/50 max-md:mb-0 max-md:w-full max-md:max-w-none max-md:rounded-b-none';

/** Dialog menu (ponsel) + dialog alasan pembatalan. Pasang sekali per halaman. */
export function TxActionDialogs() {
  return (
    <>
      <dialog id="tx-menu" className={sheetClass} aria-labelledby="tx-menu-title">
        <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted md:hidden" />
          <h2 id="tx-menu-title" className="text-lg font-semibold" data-field="label" />
          <p className="text-sm text-muted-foreground">
            #<span data-field="number" /> · <span data-field="summary" />
          </p>
          <div className="mt-4 grid gap-2">
            <a data-href="detail" className="flex h-12 items-center gap-3 rounded-xl bg-muted/60 px-4 font-medium active:bg-muted">
              <Eye className="size-5 text-muted-foreground" /> Lihat detail
            </a>
            <a data-href="fix" className="flex h-12 items-center gap-3 rounded-xl bg-muted/60 px-4 font-medium active:bg-muted">
              <Pencil className="size-5 text-primary" />
              <span className="grid leading-tight">
                Perbaiki
                <span className="text-xs font-normal text-muted-foreground">Buka form berisi data ini, ubah yang salah, simpan</span>
              </span>
            </a>
            <button type="button" data-open-void className="flex h-12 items-center gap-3 rounded-xl bg-destructive/10 px-4 text-left font-medium text-destructive">
              <Undo2 className="size-5" />
              <span className="grid leading-tight">
                Batalkan
                <span className="text-xs font-normal opacity-80">Saldo dikembalikan, transaksi ditandai dibatalkan</span>
              </span>
            </button>
          </div>
        </div>
      </dialog>

      <dialog id="tx-void" className={sheetClass} aria-labelledby="tx-void-title">
        <form method="post" className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <input type="hidden" name="_action" value="void" />
          <input type="hidden" name="returnTo" />
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted md:hidden" />
          <h2 id="tx-void-title" className="text-lg font-semibold">
            Batalkan transaksi #<span data-field="number" />?
          </h2>
          <p className="text-sm text-muted-foreground">
            <span data-field="label" /> · <span data-field="summary" />
          </p>
          <p className="mt-3 rounded-xl bg-muted/60 px-4 py-3 text-sm" data-field="effect" />
          <Field id="tx-void-reason" label="Alasan pembatalan" hint="Contoh: salah ketik berat, salah pilih nasabah." className="mt-4">
            <Input id="tx-void-reason" name="reason" required minLength={5} maxLength={200} autoComplete="off" />
          </Field>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" className="h-11 rounded-xl" data-close>
              Kembali
            </Button>
            <Button type="submit" variant="destructive" className="h-11 rounded-xl">
              Batalkan
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
