import type { ReactNode } from 'react';
import { KeyRound, Search, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ErrorAlert, Field, FormActions, FormCard } from './forms';
import { EmptyState, InitialsAvatar, Pagination, type PaginationProps } from './shared';
import { MobileEmpty } from '../mobile/Lists';

export type UserRow = {
  id: number;
  username: string;
  initials: string;
  role: 'ADMIN' | 'USER';
  customer: { id: number; name: string; accountNumber: string } | null;
  isMe: boolean;
  createdAt: string;
};

export function UsersTable({ rows, q, pagination }: { rows: UserRow[]; q: string; pagination: PaginationProps }) {
  return (
    <Card className="gap-0 py-0">
      <form method="get" className="flex items-center gap-2 border-b p-4">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" name="q" defaultValue={q} placeholder="Cari username atau nama nasabah" className="pl-8" aria-label="Cari akun" />
        </div>
        <Button type="submit" variant="outline">
          Cari
        </Button>
      </form>
      {rows.length === 0 ? (
        <EmptyState>{q ? `Tidak ada akun yang cocok dengan “${q}”.` : 'Belum ada akun.'}</EmptyState>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="pl-4">Pengguna</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Nasabah</TableHead>
              <TableHead>Reset password</TableHead>
              <TableHead className="w-0 pr-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <InitialsAvatar text={u.initials} />
                    <div className="grid leading-tight">
                      <span className="font-medium">
                        {u.username} {u.isMe && <span className="font-normal text-muted-foreground">(Anda)</span>}
                      </span>
                      <span className="text-xs text-muted-foreground">Dibuat {u.createdAt}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{u.role === 'ADMIN' ? <Badge>Admin</Badge> : <Badge variant="secondary">Nasabah</Badge>}</TableCell>
                <TableCell>
                  {u.customer ? (
                    <a href={`/customers/${u.customer.id}`} className="hover:underline">
                      {u.customer.name} <span className="text-xs text-muted-foreground">{u.customer.accountNumber}</span>
                    </a>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <form method="post" className="flex max-w-xs gap-2" data-confirm={`Reset password ${u.username}? Pengguna akan keluar dari semua perangkat.`}>
                    <input type="hidden" name="_action" value="reset" />
                    <input type="hidden" name="id" value={u.id} />
                    <Input type="password" name="password" placeholder="Password baru" minLength={8} required autoComplete="new-password" className="h-7" />
                    <Button type="submit" variant="outline" size="sm">
                      <KeyRound /> Reset
                    </Button>
                  </form>
                </TableCell>
                <TableCell className="pr-4">
                  {!u.isMe && (
                    <form method="post" data-confirm={`Hapus akun ${u.username}?`}>
                      <input type="hidden" name="_action" value="delete" />
                      <input type="hidden" name="id" value={u.id} />
                      <Button type="submit" variant="ghost" size="icon" className="text-destructive" aria-label={`Hapus ${u.username}`}>
                        <Trash2 />
                      </Button>
                    </form>
                  )}
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

export function CreateUserForm({
  values,
  error,
  picker,
}: {
  values: { username: string; role: string };
  error: string;
  /** <CustomerPicker> (island) dari halaman Astro, lewat slot bernama "picker" */
  picker?: ReactNode;
}) {
  return (
    <form method="post">
      <input type="hidden" name="_action" value="create" />
      <FormCard className="overflow-visible" title="Buat akun" description="Akun nasabah dipakai untuk melihat saldo & mutasi dari HP.">
        <ErrorAlert message={error} />
        <Field id="username" label="Username" hint="3–30 karakter: huruf kecil, angka, titik, strip, underscore.">
          <Input id="username" name="username" defaultValue={values.username} required autoComplete="off" autoCapitalize="none" />
        </Field>
        <Field id="password" label="Password" hint="Minimal 8 karakter.">
          <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
        </Field>
        <Field id="role" label="Role">
          <NativeSelect id="role" name="role" defaultValue={values.role} className="w-full">
            <NativeSelectOption value="USER">Nasabah</NativeSelectOption>
            <NativeSelectOption value="ADMIN">Admin / petugas</NativeSelectOption>
          </NativeSelect>
        </Field>
        <Field id="customerId-search" label="Hubungkan ke nasabah" hint="Wajib untuk role Nasabah.">
          {picker}
        </Field>
      </FormCard>
      <FormActions submitLabel="Buat akun" sticky={false} />
    </form>
  );
}

/** Daftar akun versi ponsel: satu kartu per akun dengan reset password & hapus. */
export function UsersMobileList({ rows, empty }: { rows: UserRow[]; empty: string }) {
  if (rows.length === 0) return <MobileEmpty>{empty}</MobileEmpty>;
  return (
    <div className="grid gap-3">
      {rows.map((u) => (
        <div key={u.id} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/5">
          <div className="flex items-center gap-3">
            <InitialsAvatar text={u.initials} className="size-10 text-sm" />
            <div className="grid min-w-0 flex-1 leading-tight">
              <span className="truncate font-semibold">
                {u.username} {u.isMe && <span className="font-normal text-muted-foreground">(Anda)</span>}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {u.customer ? `${u.customer.name} · ${u.customer.accountNumber}` : 'Tidak terhubung ke nasabah'}
              </span>
            </div>
            {u.role === 'ADMIN' ? <Badge>Admin</Badge> : <Badge variant="secondary">Nasabah</Badge>}
          </div>
          <div className="mt-3 flex gap-2">
            <form method="post" className="flex flex-1 gap-2" data-confirm={`Reset password ${u.username}?`}>
              <input type="hidden" name="_action" value="reset" />
              <input type="hidden" name="id" value={u.id} />
              <Input type="password" name="password" placeholder="Password baru" minLength={8} required autoComplete="new-password" className="h-9" />
              <Button type="submit" variant="outline" size="lg">
                <KeyRound /> Reset
              </Button>
            </form>
            {!u.isMe && (
              <form method="post" data-confirm={`Hapus akun ${u.username}?`}>
                <input type="hidden" name="_action" value="delete" />
                <input type="hidden" name="id" value={u.id} />
                <Button type="submit" variant="outline" size="icon-lg" className="text-destructive" aria-label={`Hapus ${u.username}`}>
                  <Trash2 />
                </Button>
              </form>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
