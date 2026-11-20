import type { TransactionKind, TransactionStatus } from "./shared";
import type { StatementOrg } from "./BankStatementPrint";

export type GlobalStatementSummary = {
  periodLabel: string;
  totalDeposits: string;
  totalWithdrawals: string;
  netCashflow: string;
  totalWeight: string;
  totalCustomerBalance: string;
  transactionCount: number;
};

export type GlobalWasteRecap = {
  name: string;
  weight: string;
  amount: string;
};

export type GlobalStatementRow = {
  id: number;
  number: string;
  date: string;
  customerName: string;
  accountNumber: string;
  type: TransactionKind;
  description: string;
  note: string | null;
  amount: string;
  processedBy: string;
  status: TransactionStatus;
};

export function GlobalStatementPrint({
  org,
  summary,
  wasteRecap,
  rows,
  printedAt,
  scopeLabel,
}: {
  org: StatementOrg;
  summary: GlobalStatementSummary;
  wasteRecap: GlobalWasteRecap[];
  rows: GlobalStatementRow[];
  printedAt: string;
  scopeLabel: string;
}) {
  const contactLine = [
    org.phone && `Telp: ${org.phone}`,
    org.email && `Email: ${org.email}`,
  ]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <section className="statement-print hidden text-[10px] leading-[1.45] text-neutral-900 print:block">
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
            Laporan Mutasi Global
          </div>
          <div className="text-[10px] font-semibold text-primary">
            {summary.periodLabel}
          </div>
          <div className="mt-1 text-[9.5px] text-neutral-600">
            Dicetak: {printedAt}
          </div>
          <div className="text-[9.5px] text-neutral-500">{scopeLabel}</div>
        </div>
      </header>

      <div className="mt-3.5 grid grid-cols-4 gap-2.5 rounded-sm border border-neutral-300 bg-neutral-50/70 p-3">
        <div>
          <div className="text-[9px] uppercase text-neutral-500">
            Total Setoran (Kredit)
          </div>
          <div className="mt-0.5 text-xs font-bold tabular-nums text-neutral-900">
            {summary.totalDeposits}
          </div>
          <div className="text-[9px] text-neutral-500">
            Sampah: {summary.totalWeight}
          </div>
        </div>
        <div className="border-l border-neutral-300 pl-2.5">
          <div className="text-[9px] uppercase text-neutral-500">
            Total Penarikan (Debit)
          </div>
          <div className="mt-0.5 text-xs font-bold tabular-nums text-neutral-900">
            {summary.totalWithdrawals}
          </div>
          <div className="text-[9px] text-neutral-500">
            {summary.transactionCount} transaksi
          </div>
        </div>
        <div className="border-l border-neutral-300 pl-2.5">
          <div className="text-[9px] uppercase text-neutral-500">
            Arus Kas Bersih
          </div>
          <div className="mt-0.5 text-xs font-bold tabular-nums text-neutral-900">
            {summary.netCashflow}
          </div>
          <div className="text-[9px] text-neutral-500">Setor − Tarik</div>
        </div>
        <div className="border-l border-neutral-300 pl-2.5">
          <div className="text-[9px] uppercase text-neutral-500">
            Total Saldo Nasabah
          </div>
          <div className="mt-0.5 text-xs font-bold tabular-nums text-primary">
            {summary.totalCustomerBalance}
          </div>
          <div className="text-[9px] text-neutral-500">Posisi saat cetak</div>
        </div>
      </div>

      {wasteRecap.length > 0 && (
        <div className="mt-3.5">
          <div className="mb-1 text-[9.5px] font-bold uppercase tracking-wide text-neutral-700">
            Rekap Sampah Masuk ({summary.periodLabel})
          </div>
          <table className="w-full border-collapse border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100 text-[9px] font-semibold uppercase text-neutral-700">
                <th className="border-b border-neutral-300 px-2 py-1.5 text-left">
                  Jenis Sampah
                </th>
                <th className="w-[110px] border-b border-neutral-300 px-2 py-1.5 text-right">
                  Total Berat
                </th>
                <th className="w-[130px] border-b border-neutral-300 px-2 py-1.5 text-right">
                  Total Nilai
                </th>
              </tr>
            </thead>
            <tbody>
              {wasteRecap.map((w, i) => (
                <tr
                  key={w.name}
                  className={i % 2 === 1 ? "bg-neutral-50/50" : undefined}
                >
                  <td className="border-b border-neutral-200 px-2 py-1 font-medium text-neutral-900">
                    {w.name}
                  </td>
                  <td className="border-b border-neutral-200 px-2 py-1 text-right tabular-nums text-neutral-800">
                    {w.weight}
                  </td>
                  <td className="border-b border-neutral-200 px-2 py-1 text-right tabular-nums text-neutral-900">
                    {w.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4">
        <div className="mb-1 text-[9.5px] font-bold uppercase tracking-wide text-neutral-700">
          Rincian Mutasi Transaksi
        </div>
        <table className="w-full border-collapse border border-neutral-300">
          <thead>
            <tr className="bg-neutral-100 text-[9px] font-semibold uppercase tracking-wide text-neutral-700">
              <th className="w-[96px] border-b border-neutral-300 px-2 py-1.5 text-left">
                Tanggal
              </th>
              <th className="w-[62px] border-b border-neutral-300 px-2 py-1.5 text-left">
                No. Bukti
              </th>
              <th className="w-[140px] border-b border-neutral-300 px-2 py-1.5 text-left">
                Nasabah
              </th>
              <th className="border-b border-neutral-300 px-2 py-1.5 text-left">
                Keterangan
              </th>
              <th className="w-[88px] border-b border-neutral-300 px-2 py-1.5 text-right">
                Debit (DB)
              </th>
              <th className="w-[88px] border-b border-neutral-300 px-2 py-1.5 text-right">
                Kredit (CR)
              </th>
              <th className="w-[66px] border-b border-neutral-300 px-2 py-1.5 text-left">
                Petugas
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
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
                    <td className="border-b border-neutral-200 px-2 py-1.5 align-top font-mono text-[9px] text-neutral-600">
                      #{t.number}
                    </td>
                    <td className="border-b border-neutral-200 px-2 py-1.5 align-top">
                      <div className="font-medium text-neutral-900">
                        {t.customerName}
                      </div>
                      <div className="font-mono text-[8.5px] text-neutral-500">
                        {t.accountNumber}
                      </div>
                    </td>
                    <td className="border-b border-neutral-200 px-2 py-1.5 align-top">
                      <div
                        className={
                          voided
                            ? "text-neutral-500 line-through"
                            : "text-neutral-900"
                        }
                      >
                        {t.description}
                        {voided && (
                          <span className="ml-1 text-[8.5px] font-semibold uppercase no-underline">
                            [Dibatalkan]
                          </span>
                        )}
                        {reversal && (
                          <span className="ml-1 text-[8.5px] font-semibold uppercase text-neutral-600">
                            [Koreksi]
                          </span>
                        )}
                      </div>
                      {t.note && (
                        <div className="text-[9px] text-neutral-600">
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
                    <td className="border-b border-neutral-200 px-2 py-1.5 align-top text-neutral-600">
                      {t.processedBy}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr className="bg-neutral-100 font-semibold text-neutral-900">
              <td
                colSpan={4}
                className="border-t border-neutral-300 px-2 py-2 text-right text-[9px] uppercase tracking-wide"
              >
                Total Mutasi Aktif ({summary.periodLabel})
              </td>
              <td className="border-t border-neutral-300 px-2 py-2 text-right tabular-nums whitespace-nowrap">
                {summary.totalWithdrawals}
              </td>
              <td className="border-t border-neutral-300 px-2 py-2 text-right tabular-nums whitespace-nowrap">
                {summary.totalDeposits}
              </td>
              <td className="border-t border-neutral-300 px-2 py-2" />
            </tr>
          </tfoot>
        </table>
      </div>

      <footer className="mt-5 flex items-end justify-between gap-6 border-t border-neutral-300 pt-3 text-[9.5px] text-neutral-600">
        <div className="max-w-md space-y-1">
          {org.receiptFooter && (
            <p className="font-medium text-neutral-800">{org.receiptFooter}</p>
          )}
          <p>
            Keterangan: Transaksi berstatus <strong>[Dibatalkan]</strong> dan{" "}
            <strong>[Koreksi]</strong> ditampilkan sebagai jejak audit dan tidak
            dihitung dalam total mutasi aktif.
          </p>
          <p className="text-neutral-500">
            Dokumen ini dicetak secara otomatis oleh sistem {org.appName} pada{" "}
            {printedAt}.
          </p>
        </div>
        <div className="flex shrink-0 gap-8 text-center">
          <div>
            <div className="mb-10 text-neutral-600">Bendahara</div>
            <div className="w-36 border-t border-neutral-400 pt-1 text-[9px] text-neutral-500">
              ( Nama jelas )
            </div>
          </div>
          <div>
            <div className="mb-10 text-neutral-600">
              Ketua {org.organizationName}
            </div>
            <div className="w-36 border-t border-neutral-400 pt-1 text-[9px] text-neutral-500">
              ( Nama jelas )
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}
