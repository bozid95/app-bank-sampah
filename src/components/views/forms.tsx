import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function Field({ id, label, hint, children, className }: { id: string; label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function FormCard({ title, description, children, className }: { title?: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <Card className={cn('rounded-2xl md:rounded-xl', className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="grid gap-4">{children}</CardContent>
    </Card>
  );
}

export function FormActions({ submitLabel, cancelHref, sticky = true, children }: { submitLabel: string; cancelHref?: string; sticky?: boolean; children?: ReactNode }) {
  return (
    <div
      className={cn(
        'mt-4 flex items-center justify-end gap-2',
        sticky &&
          'fixed inset-x-0 bottom-0 z-30 mt-0 border-t bg-background px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:static md:mt-4 md:border-0 md:bg-transparent md:p-0 md:shadow-none print:hidden',
      )}
    >
      {children}
      {cancelHref && (
        <Button asChild variant="outline" className="only-desktop">
          <a href={cancelHref}>Batal</a>
        </Button>
      )}
      <Button type="submit" size="lg" className="h-11 flex-1 rounded-xl text-base md:h-9 md:flex-none md:rounded-lg md:text-sm">
        {submitLabel}
      </Button>
    </div>
  );
}

export function ErrorAlert({ message }: { message: string }) {
  if (!message) return null;
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export function DangerZone({ title, description, buttonLabel, confirm, disabled }: { title: string; description: string; buttonLabel: string; confirm: string; disabled?: boolean }) {
  return (
    <Card className="mt-6 ring-destructive/20">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form method="post" data-confirm={confirm}>
          <input type="hidden" name="_action" value="delete" />
          <Button type="submit" variant="destructive" disabled={disabled}>
            {buttonLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function ConfirmSheet({ id, title, confirmLabel }: { id: string; title: string; confirmLabel: string }) {
  return (
    <dialog
      id={id}
      aria-labelledby={`${id}-title`}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-card text-card-foreground shadow-xl backdrop:bg-black/50 max-md:mb-0 max-md:w-full max-md:max-w-none max-md:rounded-b-none"
    >
      <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted md:hidden" />
        <h2 id={`${id}-title`} className="text-lg font-semibold">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">Periksa sekali lagi sebelum disimpan.</p>
        <dl data-confirm-body className="mt-3 divide-y rounded-xl bg-muted/50 px-4 text-sm" />
        <ul data-confirm-warnings hidden className="mt-3 grid gap-1 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300" />
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" className="h-11 rounded-xl" data-confirm-cancel>
            Periksa lagi
          </Button>
          <Button type="button" className="h-11 rounded-xl" data-confirm-ok>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

export type FixInfo = {
  number: string;
  /** Mis. "Setoran Rp 875.000 · Agus Salim · 20 Nov 2026, 22.20" */
  summary: string;
  reason: string;
  detailHref: string;
};

/** Penanda mode "Perbaiki transaksi" di form setor/tarik, berisi alasan perbaikan. */
export function FixBanner({ fix }: { fix: FixInfo }) {
  return (
    <div className="grid gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
      <div className="text-sm">
        <div className="font-semibold text-amber-900 dark:text-amber-200">
          Memperbaiki transaksi{' '}
          <a href={fix.detailHref} className="underline">
            #{fix.number}
          </a>
        </div>
        <div className="text-amber-800 dark:text-amber-300">{fix.summary}</div>
        <div className="mt-1 text-xs text-amber-800/80 dark:text-amber-300/80">
          Data lama sudah diisikan. Ubah yang salah lalu simpan — transaksi lama otomatis dibatalkan dan diganti yang baru. Jika form
          ditinggalkan, tidak ada yang berubah.
        </div>
      </div>
      <Field id="fixReason" label="Alasan perbaikan">
        <input
          id="fixReason"
          name="fixReason"
          defaultValue={fix.reason}
          required
          minLength={5}
          maxLength={200}
          className="h-10 w-full rounded-lg border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
        />
      </Field>
    </div>
  );
}
