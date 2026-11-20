let globalBound = false;
let current: DOMStringMap | null = null;

function fill(dialog: HTMLElement, d: DOMStringMap) {
  dialog.querySelectorAll<HTMLElement>("[data-field]").forEach((el) => {
    const key = el.dataset.field!;
    el.textContent =
      key === "effect"
        ? d.deposit === "1"
          ? "Saldo nasabah dikurangi kembali sebesar setoran ini. Transaksi tetap tercatat dengan tanda “Dibatalkan”."
          : "Saldo nasabah dikembalikan sebesar penarikan ini. Transaksi tetap tercatat dengan tanda “Dibatalkan”."
        : (d[key] ?? "");
  });
}

function openVoid(d: DOMStringMap) {
  const voidDialog = document.getElementById(
    "tx-void",
  ) as HTMLDialogElement | null;
  if (!voidDialog) return;
  const voidForm = voidDialog.querySelector("form")!;
  fill(voidDialog, d);
  voidForm.action = `/transactions/${d.id}`;
  const back = new URL(location.href);
  back.searchParams.delete("ok");
  back.searchParams.delete("err");
  (voidForm.elements.namedItem("returnTo") as HTMLInputElement).value =
    back.pathname + back.search;
  (voidForm.elements.namedItem("reason") as HTMLInputElement).value = "";
  voidDialog.showModal();
}

export function setupTxActions() {
  const menu = document.getElementById("tx-menu") as HTMLDialogElement | null;
  const voidDialog = document.getElementById(
    "tx-void",
  ) as HTMLDialogElement | null;
  if (!menu || !voidDialog) return;
  if (menu.dataset.txBound === "1") return;
  menu.dataset.txBound = "1";

  const voidForm = voidDialog.querySelector("form")!;

  if (!globalBound) {
    globalBound = true;
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const menuBtn = target.closest<HTMLElement>("[data-tx-menu]");
      if (menuBtn) {
        const activeMenu = document.getElementById(
          "tx-menu",
        ) as HTMLDialogElement | null;
        if (!activeMenu) return;
        current = menuBtn.dataset;
        fill(activeMenu, current);
        activeMenu.querySelector<HTMLAnchorElement>(
          "[data-href=detail]",
        )!.href = current.detailHref ?? "#";
        activeMenu.querySelector<HTMLAnchorElement>("[data-href=fix]")!.href =
          current.fixHref ?? "#";
        activeMenu.showModal();
        return;
      }
      const voidBtn = target.closest<HTMLElement>("[data-tx-void]");
      if (voidBtn) openVoid(voidBtn.dataset);
    });
  }

  menu.querySelector("[data-open-void]")?.addEventListener("click", () => {
    menu.close();
    if (current) openVoid(current);
  });
  voidDialog
    .querySelector("[data-close]")
    ?.addEventListener("click", () => voidDialog.close());
  for (const d of [menu, voidDialog])
    d.addEventListener("click", (e) => e.target === d && d.close());
  voidForm.addEventListener("submit", () =>
    setTimeout(() =>
      voidForm
        .querySelectorAll<HTMLButtonElement>("button")
        .forEach((b) => (b.disabled = true)),
    ),
  );
}
