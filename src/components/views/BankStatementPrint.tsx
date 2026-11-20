import type { TransactionKind, TransactionStatus } from "./shared";

export type StatementOrg = {
  appName: string;
  organizationName: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  receiptFooter: string | null;
};

export type StatementCustomer = {
  name: string;
  accountNumber: string;
  address: string | null;
  phone: string | null;
  joinedAt: string;
  balance: string;
  totalDeposits: string;
  totalWithdrawals: string;
  totalWeight: string;
};

export type StatementRow = {
  id: number;
  number: string;
  date: string;
  type: TransactionKind;
  description: string;
  note: string | null;
  amount: string;
  balanceAfter: string;
  status: TransactionStatus;
};

export function BankStatementPrint({
  org,
  customer,
  rows,
  printedAt,
  scopeLabel,
  periodLabel,
  openingBalance,
  closingBalance,
}: {
  org: StatementOrg;
  customer: StatementCustomer;
  rows: StatementRow[];
  printedAt: string;
  scopeLabel: string;
  periodLabel?: string;
  openingBalance?: string;
  closingBalance?: string;
}) {
  const contactLine = [
    org.phone && `Telp: ${org.phone}`,
    org.email && `Email: ${org.email}`,
  ]
    .filter(Boolean)
    .join("  ·  ");
  const finalBalance = closingBalance ?? customer.balance;

  return (
    <section className="statement-print hidden text-[10.5px] leading-[1.45] text-neutral-900 print:block">
      <header className="flex items-start justify-between gap-6 border-b-2 border-primary pb-3">
        <div className="min-w-0">
          <div className="text-base font-bold tracking-tight text-primary">
            {org.organizationName}
          </div>
          {org.organizationName !== org.appName && (
            <div className="text-[10px] font-medium text-neutral-600">
              {org.appName}
            </div>
          )}
          {org.address && (
            <div className="mt-1 text-[10px] text-neutral-600">
              {org.address}
            </div>
          )}
          {contactLine && (
            <div className="text-[10px] text-neutral-600">{contactLine}</div>
          )}
        </div>
        <div className="shrink-0 text-right">
          <div className="text-sm font-bold tracking-wider uppercase text-neutral-900">
            Rekening Koran
          </div>
          <div className="text-[10px] font-semibold text-primary">
            {periodLabel ?? "Mutasi Buku Tabungan"}
          </div>
          <div className="mt-1.5 text-[9.5px] text-neutral-600">
            Dicetak: {printedAt}
          </div>
          <div className="text-[9.5px] text-neutral-500">{scopeLabel}</div>
        </div>
      </header>

      <div className="mt-3.5 grid grid-cols-2 gap-4 rounded-sm border border-neutral-300 bg-neutral-50/70 p-3">
        <dl className="grid grid-cols-[96px_1fr] gap-x-2 gap-y-1">
          <dt className="text-neutral-500">Nama Nasabah</dt>
          <dd className="font-semibold text-neutral-900">{customer.name}</dd>

          <dt className="text-neutral-500">No. Rekening</dt>
          <dd className="font-mono font-semibold text-neutral-900">
            {customer.accountNumber}
          </dd>

          <dt className="text-neutral-500">Alamat</dt>
          <dd className="text-neutral-800">{customer.address || "-"}</dd>

          <dt className="text-neutral-500">Telepon</dt>
          <dd className="text-neutral-800">{customer.phone || "-"}</dd>

          <dt className="text-neutral-500">Terdaftar</dt>
          <dd className="text-neutral-800">{customer.joinedAt}</dd>
        </dl>

        <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 border-l border-neutral-300 pl-4">
          <dt className="text-neutral-500">Mata Uang</dt>
          <dd className="text-right font-mono font-medium">IDR (Rupiah)</dd>

          {openingBalance && (
            <>
              <dt className="text-neutral-500">Saldo Awal Periode</dt>
              <dd className="text-right font-medium tabular-nums text-neutral-900">
                {openingBalance}
              </dd>
            </>
          )}

          <dt className="text-neutral-500">Total Mutasi Kredit (Setor)</dt>
          <dd className="text-right font-medium tabular-nums text-neutral-900">
            {customer.totalDeposits}
          </dd>

          <dt className="text-neutral-500">Total Mutasi Debit (Tarik)</dt>
          <dd className="text-right font-medium tabular-nums text-neutral-900">
            {customer.totalWithdrawals}
          </dd>

          <dt className="text-neutral-500">Total Sampah Disetor</dt>
          <dd className="text-right font-medium tabular-nums text-neutral-900">
            {customer.totalWeight}
          </dd>

          <dt className="mt-1 border-t border-neutral-300 pt-1 font-semibold text-neutral-900">
            {periodLabel ? "Saldo Akhir Periode" : "Saldo Akhir"}
          </dt>
          <dd className="mt-1 border-t border-neutral-300 pt-1 text-right text-xs font-bold tabular-nums text-primary">
            {finalBalance}
          </dd>
        </dl>
      </div>

      <table className="mt-4 w-full border-collapse border border-neutral-300">
        <thead>
          <tr className="bg-neutral-100 text-[9.5px] font-semibold uppercase tracking-wide text-neutral-700">
            <th className="w-[105px] border-b border-neutral-300 px-2 py-2 text-left">
              Tanggal
            </th>
            <th className="w-[68px] border-b border-neutral-300 px-2 py-2 text-left">
              No. Bukti
            </th>
            <th className="border-b border-neutral-300 px-2 py-2 text-left">
              Keterangan
            </th>
            <th className="w-[98px] border-b border-neutral-300 px-2 py-2 text-right">
              Debit (DB)
            </th>
            <th className="w-[98px] border-b border-neutral-300 px-2 py-2 text-right">
              Kredit (CR)
            </th>
            <th className="w-[104px] border-b border-neutral-300 px-2 py-2 text-right">
              Saldo
            </th>
          </tr>
        </thead>
        <tbody>
          {openingBalance && (
            <tr className="bg-neutral-50 font-medium text-neutral-700">
              <td className="border-b border-neutral-200 px-2 py-1.5">—</td>
              <td className="border-b border-neutral-200 px-2 py-1.5">—</td>
              <td className="border-b border-neutral-200 px-2 py-1.5">
                Saldo Awal Periode
              </td>
              <td className="border-b border-neutral-200 px-2 py-1.5 text-right" />
              <td className="border-b border-neutral-200 px-2 py-1.5 text-right" />
              <td className="border-b border-neutral-200 px-2 py-1.5 text-right tabular-nums whitespace-nowrap text-neutral-900">
                {openingBalance}
              </td>
            </tr>
          )}
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-3 py-6 text-center text-neutral-500"
              >
                Tidak ada mutasi transaksi pada periode ini.
              </td>
            </tr>
          ) : (
            rows.map((t, idx) => {
              const voided = t.status === "voided";
              const reversal = t.status === "reversal";
              const amountClass = voided
                ? "line-through text-neutral-400"
                : "text-neutral-900";
              return (
                <tr
                  key={t.id}
                  className={idx % 2 === 1 ? "bg-neutral-50/50" : undefined}
                >
                  <td className="border-b border-neutral-200 px-2 py-1.5 align-top whitespace-nowrap text-neutral-700 tabular-nums">
                    {t.date}
                  </td>
                  <td className="border-b border-neutral-200 px-2 py-1.5 align-top font-mono text-[9.5px] text-neutral-600">
                    #{t.number}
                  </td>
                  <td className="border-b border-neutral-200 px-2 py-1.5 align-top">
                    <div
                      className={
                        voided
                          ? "text-neutral-500 line-through"
                          : "font-medium text-neutral-900"
                      }
                    >
                      {t.description}
                      {voided && (
                        <span className="ml-1.5 inline-block text-[9px] font-semibold uppercase no-underline">
                          [Dibatalkan]
                        </span>
                      )}
                      {reversal && (
                        <span className="ml-1.5 inline-block text-[9px] font-semibold uppercase text-neutral-600">
                          [Koreksi]
                        </span>
                      )}
                    </div>
                    {t.note && (
                      <div className="text-[9.5px] text-neutral-600">
                        {t.note}
                      </div>
                    )}
                  </td>
                  <td
                    className={`border-b border-neutral-200 px-2 py-1.5 text-right align-top tabular-nums whitespace-nowrap ${amountClass}`}
                  >
                    {t.type === "WITHDRAWAL" ? t.amount : ""}
                  </td>
                  <td
                    className={`border-b border-neutral-200 px-2 py-1.5 text-right align-top tabular-nums whitespace-nowrap ${amountClass}`}
                  >
                    {t.type === "DEPOSIT" ? t.amount : ""}
                  </td>
                  <td className="border-b border-neutral-200 px-2 py-1.5 text-right align-top font-medium tabular-nums whitespace-nowrap text-neutral-900">
                    {t.balanceAfter}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
        <tfoot>
          <tr className="bg-neutral-100 font-semibold text-neutral-900">
            <td
              colSpan={3}
              className="border-t border-neutral-300 px-2 py-2 text-right uppercase text-[9.5px] tracking-wide"
            >
              Total Mutasi Aktif /{" "}
              {periodLabel ? "Saldo Akhir Periode" : "Saldo Akhir"}
            </td>
            <td className="border-t border-neutral-300 px-2 py-2 text-right tabular-nums whitespace-nowrap">
              {customer.totalWithdrawals}
            </td>
            <td className="border-t border-neutral-300 px-2 py-2 text-right tabular-nums whitespace-nowrap">
              {customer.totalDeposits}
            </td>
            <td className="border-t border-neutral-300 px-2 py-2 text-right tabular-nums whitespace-nowrap text-primary">
              {finalBalance}
            </td>
          </tr>
        </tfoot>
      </table>

      <footer className="mt-4 flex items-end justify-between gap-6 border-t border-neutral-300 pt-3 text-[9.5px] text-neutral-600">
        <div className="max-w-md space-y-1">
          {org.receiptFooter && (
            <p className="font-medium text-neutral-800">{org.receiptFooter}</p>
          )}
          <p>
            Keterangan: Transaksi berstatus <strong>[Dibatalkan]</strong> dan{" "}
            <strong>[Koreksi]</strong> tetap ditampilkan sebagai jejak audit dan
            tidak dihitung dalam total mutasi aktif.
          </p>
          <p className="text-neutral-500">
            Dokumen ini dicetak secara otomatis oleh sistem {org.appName} pada{" "}
            {printedAt}.
          </p>
        </div>
        <div className="shrink-0 text-center">
          <div className="mb-10 text-neutral-600">
            Petugas {org.organizationName}
          </div>
          <div className="w-40 border-t border-neutral-400 pt-1 text-[9px] text-neutral-500">
            ( Tanda tangan &amp; nama jelas )
          </div>
        </div>
      </footer>
    </section>
  );
}
