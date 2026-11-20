import { Input } from '@/components/ui/input';
import { ErrorAlert, Field, FormActions, FormCard } from './forms';

export type CustomerValues = { name: string; address: string; phone: string };

export function CustomerForm({
  values,
  error,
  mode,
  cancelHref,
  accountNumberHint,
}: {
  values: CustomerValues;
  error: string;
  mode: 'create' | 'edit';
  cancelHref: string;
  accountNumberHint: string;
}) {
  return (
    <form method="post">
      <FormCard title="Data nasabah" description={accountNumberHint}>
        <ErrorAlert message={error} />
        <Field id="name" label="Nama lengkap">
          <Input id="name" name="name" defaultValue={values.name} required maxLength={100} autoComplete="off" />
        </Field>
        <Field id="address" label="Alamat">
          <Input id="address" name="address" defaultValue={values.address} maxLength={255} placeholder="mis. RT 01 / RW 02, Desa Sukamaju" />
        </Field>
        <Field id="phone" label="Telepon / WhatsApp">
          <Input id="phone" name="phone" inputMode="tel" defaultValue={values.phone} maxLength={20} placeholder="08xxxxxxxxxx" />
        </Field>
      </FormCard>
      <FormActions submitLabel={mode === 'create' ? 'Simpan nasabah' : 'Simpan perubahan'} cancelHref={cancelHref} />
    </form>
  );
}
