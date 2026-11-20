import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ConfirmSheet,
  ErrorAlert,
  Field,
  FixBanner,
  FormActions,
  type FixInfo,
} from "./forms";

export type WithdrawFormProps = {
  picker?: ReactNode;
  amount: string;
  note: string;
  error: string;
  cancelHref: string;
  warnWithdrawAmount: number;
  fix?: FixInfo & { customerId: number; credit: string };
};

const QUICK_AMOUNTS = [10000, 25000, 50000, 100000];

export function WithdrawForm({
  picker,
  amount,
  note,
  error,
  cancelHref,
  warnWithdrawAmount,
  fix,
}: WithdrawFormProps) {
  return (
    <form
      method="post"
      id="withdraw-form"
      data-fix-number={fix?.number}
      data-fix-customer={fix?.customerId}
      data-fix-credit={fix?.credit}
      data-warn-amount={warnWithdrawAmount}
      className="grid gap-4 lg:grid-cols-[1fr_320px] lg:items-start"
    >
      <div className="grid gap-4">
        {fix && <FixBanner fix={fix} />}
        <ErrorAlert message={error} />
        <Card className="overflow-visible">
          <CardContent className="grid gap-5">
            <Field id="customerId-search" label="Dari rekening">
              {picker}
            </Field>

            <div className="grid gap-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Jumlah penarikan
              </label>
              <div className="flex items-baseline gap-2 border-b-2 border-primary pb-1">
                <span className="text-2xl font-bold text-muted-foreground">
                  Rp
                </span>
                <input
                  id="amount"
                  name="amount"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  defaultValue={amount}
                  placeholder="0"
                  required
                  className="w-full min-w-0 bg-transparent text-[2rem] font-extrabold tabular-nums outline-none placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((v) => (
                  <Button
                    key={v}
                    type="button"
                    variant="outline"
                    size="sm"
                    data-amount={v}
                    className="rounded-full"
                  >
                    {v.toLocaleString("id-ID")}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  data-all
                  className="rounded-full"
                >
                  Semua saldo
                </Button>
              </div>
            </div>

            <Field id="note" label="Catatan (opsional)">
              <Input
                id="note"
                name="note"
                defaultValue={note}
                maxLength={255}
              />
            </Field>
          </CardContent>
        </Card>
      </div>

      <Card className="lg:sticky lg:top-20">
        <CardHeader>
          <CardTitle>Ringkasan</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Saldo tersedia</span>
            <span id="balance-info" className="font-medium tabular-nums">
              -
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Penarikan</span>
            <span
              id="withdraw-info"
              className="font-medium text-withdrawal tabular-nums"
            >
              -
            </span>
          </div>
          <Separator />
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Sisa saldo</span>
            <span
              id="remaining"
              className="text-base font-semibold tabular-nums"
            >
              -
            </span>
          </div>
          <p
            id="insufficient"
            hidden
            className="rounded-md bg-destructive/10 px-3 py-2 text-destructive"
          >
            Saldo tidak mencukupi.
          </p>
          <div className="only-desktop mt-2 grid gap-2">
            <Button type="submit" size="lg">
              {fix ? "Simpan perbaikan" : "Tarik saldo"}
            </Button>
            <Button asChild variant="outline">
              <a href={cancelHref}>Batal</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmSheet
        id="withdraw-confirm"
        title="Konfirmasi penarikan"
        confirmLabel="Ya, tarik"
      />

      <div className="only-mobile">
        <FormActions submitLabel={fix ? "Simpan perbaikan" : "Tarik saldo"} />
      </div>
    </form>
  );
}
