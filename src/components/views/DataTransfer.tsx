import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Upload } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type EntityCard = { key: string; label: string; description: string; maxRows: number; count: number };
export type ImportFeedback =
  | { entity: string; label: string; ok: true; message: string }
  | { entity: string; label: string; ok: false; errors: { line: number; message: string }[] }
  | null;

const MAX_SHOWN_ERRORS = 50;

function Feedback({ feedback }: { feedback: NonNullable<ImportFeedback> }) {
  if (feedback.ok) {
    return (
      <Alert className="border-deposit/30 bg-deposit/5 text-deposit">
        <CheckCircle2 />
        <AlertTitle>Impor {feedback.label.toLowerCase()} berhasil</AlertTitle>
        <AlertDescription>{feedback.message}</AlertDescription>
      </Alert>
    );
  }
  const shown = feedback.errors.slice(0, MAX_SHOWN_ERRORS);
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertTitle>Impor {feedback.label.toLowerCase()} dibatalkan — tidak ada data yang disimpan</AlertTitle>
      <AlertDescription>
        <p>Perbaiki baris berikut di file Excel, lalu unggah ulang:</p>
        <ul className="mt-1 grid max-h-72 gap-0.5 overflow-auto">
          {shown.map((e, i) => (
            <li key={i}>
              {e.line > 0 && <strong>Baris {e.line}: </strong>}
              {e.message}
            </li>
          ))}
        </ul>
        {feedback.errors.length > shown.length && <p className="mt-1">…dan {feedback.errors.length - shown.length} kesalahan lainnya.</p>}
      </AlertDescription>
    </Alert>
  );
}

export function DataTransferView({ cards, feedback }: { cards: EntityCard[]; feedback: ImportFeedback }) {
  return (
    <div className="grid gap-4">
      {feedback && <Feedback feedback={feedback} />}

      <div className="grid gap-4 xl:grid-cols-2">
        {cards.map((c) => (
          <Card key={c.key} id={c.key} className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="size-4 text-primary" /> {c.label}
              </CardTitle>
              <CardDescription>
                {c.description} Saat ini {c.count} data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form method="post" encType="multipart/form-data" className="grid gap-2">
                <input type="hidden" name="entity" value={c.key} />
                <Label htmlFor={`file-${c.key}`}>Impor dari Excel</Label>
                <div className="flex gap-2">
                  <Input id={`file-${c.key}`} name="file" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" required className="flex-1" />
                  <Button type="submit">
                    <Upload /> Impor
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Maks. {c.maxRows.toLocaleString('id-ID')} baris. Jika ada baris yang salah, tidak ada data yang disimpan.
                </p>
              </form>
            </CardContent>
            <CardFooter className="mt-auto flex flex-wrap gap-2 border-t">
              <Button asChild variant="outline" size="sm">
                <a href={`/data/template/${c.key}`}>
                  <Download /> Template kosong
                </a>
              </Button>
              {c.key === 'transactions' ? (
                <form method="get" action="/data/export/transactions" className="flex flex-wrap items-center gap-2">
                  <Input type="date" name="from" aria-label="Dari tanggal" className="h-7 w-auto" />
                  <span className="text-xs text-muted-foreground">s/d</span>
                  <Input type="date" name="to" aria-label="Sampai tanggal" className="h-7 w-auto" />
                  <Button type="submit" variant="outline" size="sm">
                    <Download /> Ekspor
                  </Button>
                </form>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <a href={`/data/export/${c.key}`}>
                    <Download /> Ekspor data
                  </a>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
