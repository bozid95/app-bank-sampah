import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FlashAlert({
  ok,
  err,
}: {
  ok: string | null;
  err: string | null;
}) {
  const message = err || ok;
  if (!message) return null;
  const isError = Boolean(err);

  return (
    <dialog
      id="app-alert"
      aria-labelledby="app-alert-title"
      aria-describedby="app-alert-desc"
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-card p-0 text-card-foreground shadow-xl ring-1 ring-foreground/10 backdrop:bg-black/50 print:hidden"
    >
      <div className="grid justify-items-center gap-3 p-6 text-center">
        <span
          className={
            isError
              ? "flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive"
              : "flex size-12 items-center justify-center rounded-full bg-deposit/10 text-deposit"
          }
        >
          {isError ? (
            <AlertCircle className="size-6" />
          ) : (
            <CheckCircle2 className="size-6" />
          )}
        </span>
        <div className="grid gap-1">
          <h2 id="app-alert-title" className="text-lg font-semibold">
            {isError ? "Gagal" : "Berhasil"}
          </h2>
          <p id="app-alert-desc" className="text-sm text-muted-foreground">
            {message}
          </p>
        </div>
        <Button
          type="button"
          variant={isError ? "destructive" : "default"}
          className="mt-2 h-10 w-full rounded-xl"
          data-alert-close
        >
          OK
        </Button>
      </div>
    </dialog>
  );
}
