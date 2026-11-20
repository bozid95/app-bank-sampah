export type ConfirmSummary = {
  rows: { label: string; value: string; strong?: boolean }[];
  warnings: string[];
  block?: boolean;
};

export function setupConfirmSheet(form: HTMLFormElement | null, dialogId: string, summarize: () => ConfirmSummary) {
  const dialog = document.getElementById(dialogId) as HTMLDialogElement | null;
  if (!form || !dialog) return;
  const body = dialog.querySelector<HTMLElement>('[data-confirm-body]')!;
  const warnings = dialog.querySelector<HTMLElement>('[data-confirm-warnings]')!;
  const ok = dialog.querySelector<HTMLButtonElement>('[data-confirm-ok]')!;
  let confirmed = false;

  form.addEventListener('submit', (e) => {
    if (confirmed) {
      setTimeout(() => {
        form.querySelectorAll<HTMLButtonElement>('button[type=submit]').forEach((b) => {
          b.disabled = true;
          b.textContent = 'Menyimpan…';
        });
      });
      return;
    }
    e.preventDefault();
    const s = summarize();
    body.replaceChildren(
      ...s.rows.map((r) => {
        const row = document.createElement('div');
        row.className = 'flex justify-between gap-4 py-2.5';
        const dt = document.createElement('dt');
        dt.className = 'text-muted-foreground';
        dt.textContent = r.label;
        const dd = document.createElement('dd');
        dd.className = r.strong ? 'text-right text-base font-bold tabular-nums' : 'text-right font-medium tabular-nums';
        dd.textContent = r.value;
        row.append(dt, dd);
        return row;
      }),
    );
    warnings.replaceChildren(
      ...s.warnings.map((w) => {
        const li = document.createElement('li');
        li.textContent = `⚠ ${w}`;
        return li;
      }),
    );
    warnings.hidden = s.warnings.length === 0;
    ok.disabled = Boolean(s.block);
    dialog.showModal();
  });

  ok.addEventListener('click', () => {
    confirmed = true;
    dialog.close();
    form.requestSubmit();
  });
  dialog.querySelector('[data-confirm-cancel]')?.addEventListener('click', () => dialog.close());
  // Klik di luar lembar = tutup
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
}

export const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 2 });
