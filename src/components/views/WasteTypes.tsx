import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ErrorAlert, Field, FormActions, FormCard } from "./forms";
import { EmptyState, Pagination, type PaginationProps } from "./shared";

export type WasteTypeRow = {
  id: number;
  name: string;
  price: string;
  isActive: boolean;
  usage: number;
};

export function WasteTypesTable({
  rows,
  pagination,
}: {
  rows: WasteTypeRow[];
  pagination: PaginationProps;
}) {
  return (
    <Card className="gap-0 py-0">
      {rows.length === 0 ? (
        <EmptyState>Belum ada jenis sampah.</EmptyState>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="pl-4">Nama</TableHead>
              <TableHead className="text-right">Harga / kg</TableHead>
              <TableHead className="text-right">Dipakai</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-0 pr-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((w) => (
              <TableRow key={w.id}>
                <TableCell className="pl-4 font-medium">{w.name}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {w.price}
                </TableCell>
                <TableCell className="text-right text-muted-foreground tabular-nums">
                  {w.usage}×
                </TableCell>
                <TableCell>
                  {w.isActive ? (
                    <Badge
                      variant="outline"
                      className="border-deposit/30 bg-deposit/10 text-deposit"
                    >
                      Aktif
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Nonaktif</Badge>
                  )}
                </TableCell>
                <TableCell className="pr-4">
                  <Button asChild variant="ghost" size="sm">
                    <a href={`/waste-types/${w.id}`}>
                      <Pencil /> Edit
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Pagination {...pagination} />
    </Card>
  );
}

export type WasteTypeValues = {
  name: string;
  price: string;
  isActive: boolean;
};

export function WasteTypeForm({
  values,
  error,
  mode,
}: {
  values: WasteTypeValues;
  error: string;
  mode: "create" | "edit";
}) {
  return (
    <form method="post">
      <FormCard
        title={mode === "create" ? "Tambah jenis sampah" : "Data jenis sampah"}
        description={
          mode === "create"
            ? "Harga dipakai untuk menghitung nilai setoran."
            : "Perubahan harga hanya berlaku untuk setoran berikutnya."
        }
      >
        <ErrorAlert message={error} />
        <Field id="name" label="Nama">
          <Input
            id="name"
            name="name"
            defaultValue={values.name}
            required
            maxLength={80}
            placeholder="mis. Plastik botol (PET)"
          />
        </Field>
        <Field
          id="price"
          label="Harga per kg (Rp)"
          hint="Gunakan titik untuk ribuan, mis. 1.500"
        >
          <Input
            id="price"
            name="price"
            inputMode="decimal"
            defaultValue={values.price}
            required
            placeholder="1.500"
          />
        </Field>
        {mode === "edit" && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={values.isActive}
              className="size-4 accent-primary"
            />
            Aktif (muncul di form setoran)
          </label>
        )}
      </FormCard>
      <FormActions
        submitLabel={mode === "create" ? "Tambah" : "Simpan perubahan"}
        cancelHref={mode === "edit" ? "/waste-types" : undefined}
        sticky={mode === "edit"}
      />
    </form>
  );
}
