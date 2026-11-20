import { Award, Building2, SlidersHorizontal, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { cn } from "@/lib/utils";
import { ErrorAlert, Field, FormActions, FormCard } from "./forms";

export type SettingsTab = "general" | "rules" | "levels";

export type SettingsValues = {
  appName: string;
  organizationName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  primaryColor: string;
  defaultTheme: string;
  accountNumberPrefix: string;
  timezone: string;
  receiptFooter: string;
  warnWeightKg: string;
  warnWithdrawAmount: string;
  ecoLevels: { level: number; name: string; minKg: string; tagline: string }[];
};

const COLOR_PRESETS = [
  { value: "#1f7a4d", label: "Hijau Alam", desc: "Segar & ramah lingkungan" },
  { value: "#0f766e", label: "Toska Segar", desc: "Tenang & bersih" },
  { value: "#1d4ed8", label: "Biru Samudra", desc: "Formal & terpercaya" },
  { value: "#4338ca", label: "Indigo Modern", desc: "Elegan & kontemporer" },
  { value: "#7c3aed", label: "Ungu Lavender", desc: "Kreatif & dinamis" },
  { value: "#b45309", label: "Amber Hangat", desc: "Hangat & membumi" },
  { value: "#be123c", label: "Mawar", desc: "Berani & berenergi" },
  { value: "#334155", label: "Slate Elegan", desc: "Minimalis & netral" },
];

const TABS: { id: SettingsTab; label: string; icon: typeof Building2 }[] = [
  { id: "general", label: "Umum", icon: Building2 },
  { id: "rules", label: "Tampilan & Aturan", icon: SlidersHorizontal },
  { id: "levels", label: "Level Penghargaan", icon: Award },
];

const textareaClass =
  "min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";

export function SettingsForm({
  values,
  error,
  timezones,
  themeModes = [],
  activeTab = "general",
}: {
  values: SettingsValues;
  error: string;
  timezones: readonly { value: string; label: string }[];
  themeModes?: readonly { value: string; label: string }[];
  activeTab?: SettingsTab;
}) {
  return (
    <form method="post" id="settings-form" className="grid gap-4">
      <input
        type="hidden"
        name="_tab"
        id="settings-active-tab"
        defaultValue={activeTab}
      />
      <ErrorAlert message={error} />

      <div
        role="tablist"
        aria-label="Kategori pengaturan"
        className="flex gap-1 overflow-x-auto rounded-xl bg-muted p-1 [scrollbar-width:none]"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`panel-${id}`}
              data-tab-btn={id}
              data-active={active ? "true" : "false"}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                "data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm",
                "data-[active=false]:text-muted-foreground data-[active=false]:hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Umum (Identitas + Kontak & Struk) */}
      <div
        id="panel-general"
        role="tabpanel"
        data-tab-panel="general"
        hidden={activeTab !== "general"}
        className="grid gap-4"
      >
        <FormCard
          title="Identitas"
          description="Tampil di judul aplikasi, halaman login, struk, dan saat dipasang di HP."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              id="appName"
              label="Nama aplikasi"
              hint="Singkat, mis. “Bank Sampah Melati”."
            >
              <Input
                id="appName"
                name="appName"
                defaultValue={values.appName}
                required
                maxLength={40}
              />
            </Field>
            <Field id="organizationName" label="Nama organisasi / pengelola">
              <Input
                id="organizationName"
                name="organizationName"
                defaultValue={values.organizationName}
                required
                maxLength={100}
              />
            </Field>
          </div>
          <Field id="tagline" label="Slogan" hint="Tampil di halaman login.">
            <Input
              id="tagline"
              name="tagline"
              defaultValue={values.tagline}
              maxLength={120}
            />
          </Field>
        </FormCard>

        <FormCard
          title="Kontak & Struk"
          description="Dicetak di struk transaksi & rekening koran. Boleh dikosongkan."
        >
          <Field id="address" label="Alamat">
            <Input
              id="address"
              name="address"
              defaultValue={values.address}
              maxLength={255}
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field id="phone" label="Telepon / WhatsApp">
              <Input
                id="phone"
                name="phone"
                inputMode="tel"
                defaultValue={values.phone}
                maxLength={30}
              />
            </Field>
            <Field id="email" label="Email">
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={values.email}
                maxLength={100}
              />
            </Field>
          </div>
          <Field
            id="receiptFooter"
            label="Catatan kaki struk"
            hint="mis. “Terima kasih telah menabung sampah!”"
          >
            <textarea
              id="receiptFooter"
              name="receiptFooter"
              defaultValue={values.receiptFooter}
              maxLength={300}
              className={textareaClass}
              data-slot="textarea"
            />
          </Field>
        </FormCard>
      </div>

      <div
        id="panel-rules"
        role="tabpanel"
        data-tab-panel="rules"
        hidden={activeTab !== "rules"}
        className="grid gap-4"
      >
        <FormCard
          title="Tampilan & skema warna"
          description="Skema warna memengaruhi tombol, kartu, sidebar, dan nuansa latar di mode terang maupun gelap."
        >
          <Field id="primaryColor" label="Skema warna">
            <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-4">
              {COLOR_PRESETS.map((c) => {
                const selected = values.primaryColor.toLowerCase() === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    data-color={c.value}
                    data-selected={selected ? "true" : "false"}
                    className="flex items-center gap-2.5 rounded-xl border bg-card p-2.5 text-left transition-all hover:border-primary/50 data-[selected=true]:border-primary data-[selected=true]:ring-2 data-[selected=true]:ring-primary/25"
                  >
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg shadow-inner ring-1 ring-black/10"
                      style={{ background: c.value }}
                    />
                    <span className="min-w-0 leading-tight">
                      <span className="block truncate text-xs font-semibold text-foreground">
                        {c.label}
                      </span>
                      <span className="block truncate text-[10.5px] text-muted-foreground">
                        {c.desc}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex items-center gap-3">
              <input
                id="primaryColor"
                name="primaryColor"
                type="color"
                defaultValue={values.primaryColor}
                className="h-9 w-14 cursor-pointer rounded-lg border border-input bg-transparent p-1"
              />
              <span className="text-xs text-muted-foreground">
                Atau pilih warna kustom sesuai identitas organisasi Anda.
              </span>
            </div>
          </Field>

          <Field
            id="defaultTheme"
            label="Mode tema aplikasi"
            hint="Menentukan tema tampilan seluruh aplikasi (terang, gelap, atau otomatis mengikuti perangkat pengguna)."
          >
            <NativeSelect
              id="defaultTheme"
              name="defaultTheme"
              defaultValue={values.defaultTheme}
              className="w-full md:w-72"
            >
              {themeModes.map((m) => (
                <NativeSelectOption key={m.value} value={m.value}>
                  {m.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>

          <div className="mt-2 rounded-xl border border-border/80 bg-muted/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
              <span className="text-xs font-semibold tracking-wider text-foreground uppercase">
                Pratinjau Sinkronisasi Tema & Kartu
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  data-preview-theme="light"
                  className="rounded-lg border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  ☀️ Terang
                </button>
                <button
                  type="button"
                  data-preview-theme="dark"
                  className="rounded-lg border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  🌙 Gelap
                </button>
              </div>
            </div>
            <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/75 bg-card p-3.5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Saldo Tabungan</span>
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Wallet className="size-3.5" />
                  </span>
                </div>
                <div className="mt-1 text-lg font-bold text-card-foreground">
                  Rp 1.250.000
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                    +12.5 kg setor
                  </span>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-xl border border-border/75 bg-card p-3.5 shadow-xs">
                <div className="text-xs text-muted-foreground">
                  Elemen Tombol & Aksi
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 rounded-lg text-xs"
                  >
                    Tombol Utama
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg text-xs"
                  >
                    Sekunder
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </FormCard>

        <FormCard
          title="Aturan operasional"
          description="Format rekening, zona waktu, dan batas peringatan transaksi."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              id="accountNumberPrefix"
              label="Awalan no. rekening"
              hint="1–6 huruf besar/angka. Hanya berlaku untuk nasabah baru."
            >
              <Input
                id="accountNumberPrefix"
                name="accountNumberPrefix"
                defaultValue={values.accountNumberPrefix}
                required
                maxLength={6}
                className="uppercase"
              />
            </Field>
            <Field id="timezone" label="Zona waktu">
              <NativeSelect
                id="timezone"
                name="timezone"
                defaultValue={values.timezone}
                className="w-full"
              >
                {timezones.map((t) => (
                  <NativeSelectOption key={t.value} value={t.value}>
                    {t.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              id="warnWeightKg"
              label="Batas peringatan berat setor (kg)"
              hint="Muncul peringatan di konfirmasi jika berat per jenis melebihi angka ini. Isi 0 untuk mematikan."
            >
              <Input
                id="warnWeightKg"
                name="warnWeightKg"
                inputMode="numeric"
                defaultValue={values.warnWeightKg}
                required
              />
            </Field>
            <Field
              id="warnWithdrawAmount"
              label="Batas peringatan penarikan (Rp)"
              hint="Muncul peringatan jika penarikan mencapai angka ini atau lebih. Isi 0 untuk mematikan."
            >
              <Input
                id="warnWithdrawAmount"
                name="warnWithdrawAmount"
                inputMode="numeric"
                defaultValue={values.warnWithdrawAmount}
                required
              />
            </Field>
          </div>
        </FormCard>
      </div>

      {/* Tab 3: Level Penghargaan */}
      <div
        id="panel-levels"
        role="tabpanel"
        data-tab-panel="levels"
        hidden={activeTab !== "levels"}
        className="grid gap-4"
      >
        <FormCard
          title="Level penghargaan nasabah"
          description="Atur nama gelar, batas minimal berat sampah (kg), dan pesan apresiasi untuk tiap level."
        >
          <div className="grid gap-3">
            {values.ecoLevels.map((lvl) => (
              <div
                key={lvl.level}
                className="grid gap-2.5 rounded-xl border bg-muted/20 p-3 md:grid-cols-[72px_1fr_110px_1.4fr] md:items-end"
              >
                <div className="flex h-9 items-center text-sm font-semibold text-primary">
                  Level {lvl.level}
                </div>
                <Field id={`ecoLevelName_${lvl.level}`} label="Nama gelar">
                  <Input
                    id={`ecoLevelName_${lvl.level}`}
                    name={`ecoLevelName_${lvl.level}`}
                    defaultValue={lvl.name}
                    required
                    maxLength={40}
                  />
                </Field>
                <Field id={`ecoLevelMinKg_${lvl.level}`} label="Min. (kg)">
                  <Input
                    id={`ecoLevelMinKg_${lvl.level}`}
                    name={`ecoLevelMinKg_${lvl.level}`}
                    inputMode="numeric"
                    defaultValue={lvl.minKg}
                    readOnly={lvl.level === 1}
                    className={
                      lvl.level === 1
                        ? "bg-muted text-muted-foreground"
                        : undefined
                    }
                    required
                  />
                </Field>
                <Field
                  id={`ecoLevelTagline_${lvl.level}`}
                  label="Pesan apresiasi"
                >
                  <Input
                    id={`ecoLevelTagline_${lvl.level}`}
                    name={`ecoLevelTagline_${lvl.level}`}
                    defaultValue={lvl.tagline}
                    maxLength={120}
                  />
                </Field>
              </div>
            ))}
          </div>
        </FormCard>
      </div>

      <FormActions submitLabel="Simpan pengaturan" cancelHref="/" />
    </form>
  );
}
