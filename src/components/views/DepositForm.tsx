import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ConfirmSheet,
  ErrorAlert,
  Field,
  FixBanner,
  FormActions,
  type FixInfo,
} from "./forms";

export type DepositFormProps = {
  picker?: ReactNode;
  wasteTypes: { id: number; name: string; price: string; priceValue: string }[];
  weights: Record<number, string>;
  note: string;
  error: string;
  cancelHref: string;
  warnWeightKg: number;
  fix?: FixInfo;
};

export function DepositForm({
  picker,
  wasteTypes,
  weights,
  note,
  error,
  cancelHref,
  warnWeightKg,
  fix,
}: DepositFormProps) {
  return (
    <form
      method="post"
      id="deposit-form"
      data-fix-number={fix?.number}
      data-warn-weight={warnWeightKg}
      className="grid gap-4 lg:grid-cols-[1fr_320px] lg:items-start"
    >
      <div className="grid gap-4">
        {fix && <FixBanner fix={fix} />}
        <ErrorAlert message={error} />
        <Card className="overflow-visible">
          <CardContent>
            <Field id="customerId-search" label="Nasabah">
              {picker}
            </Field>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-4">
            <CardTitle>Berat sampah</CardTitle>
            <CardDescription>
              Isi berat (kg) untuk jenis yang disetor. Kosongkan yang tidak ada.
            </CardDescription>
          </CardHeader>
          <div className="hidden grid-cols-[1fr_120px_150px_130px] gap-4 border-b bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground md:grid">
            <span>Jenis sampah</span>
            <span className="text-right">Harga / kg</span>
            <span>Berat</span>
            <span className="text-right">Subtotal</span>
          </div>
          {wasteTypes.map((w) => (
            <div
              key={w.id}
              data-row
              className="grid grid-cols-[1fr_96px] items-center gap-x-4 gap-y-1.5 border-b px-4 py-3 last:border-b-0 data-filled:bg-primary/5 md:grid-cols-[1fr_120px_150px_130px]"
            >
              <span className="font-medium">{w.name}</span>
              <span className="text-right text-sm text-muted-foreground tabular-nums">
                {w.price}
                <span className="md:hidden">/kg</span>
              </span>
              <div className="relative">
                <Input
                  name={`weight_${w.id}`}
                  inputMode="decimal"
                  defaultValue={weights[w.id] ?? ""}
                  placeholder="0"
                  autoComplete="off"
                  data-price={w.priceValue}
                  data-name={w.name}
                  className="weight pr-9 text-right"
                  aria-label={`Berat ${w.name} (kg)`}
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
                  kg
                </span>
              </div>
              <span className="subtotal text-right font-medium tabular-nums">
                -
              </span>
            </div>
          ))}
        </Card>
      </div>

      <Card className="lg:sticky lg:top-20">
        <CardHeader>
          <CardTitle>Ringkasan</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="only-desktop">
            <div className="text-sm text-muted-foreground">Total setoran</div>
            <div className="js-total text-3xl font-semibold tracking-tight tabular-nums">
              Rp 0
            </div>
          </div>
          <Separator className="only-desktop" />
          <Field id="note" label="Catatan (opsional)">
            <Input id="note" name="note" defaultValue={note} maxLength={255} />
          </Field>
          <div className="only-desktop grid gap-2">
            <Button type="submit" size="lg">
              {fix ? "Simpan perbaikan" : "Simpan setoran"}
            </Button>
            <Button asChild variant="outline">
              <a href={cancelHref}>Batal</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmSheet
        id="deposit-confirm"
        title="Konfirmasi setoran"
        confirmLabel="Ya, simpan"
      />

      {/* Ponsel: total + tombol menempel di bawah */}
      <div className="only-mobile">
        <FormActions submitLabel={fix ? "Simpan perbaikan" : "Simpan setoran"}>
          <div className="mr-auto flex flex-col leading-tight">
            <span className="text-xs text-muted-foreground">Total</span>
            <strong className="js-total text-lg tabular-nums">Rp 0</strong>
          </div>
        </FormActions>
      </div>
    </form>
  );
}
