import { Input } from '@/components/ui/input';
import { ErrorAlert, Field, FormActions, FormCard } from './forms';

export function PasswordForm({ error }: { error: string }) {
  return (
    <form method="post">
      <FormCard title="Password" description="Setelah diubah, perangkat lain yang masih login akan otomatis keluar.">
        <ErrorAlert message={error} />
        <Field id="currentPassword" label="Password lama">
          <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
        </Field>
        <Field id="newPassword" label="Password baru" hint="Minimal 8 karakter.">
          <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength={8} required />
        </Field>
        <Field id="confirmPassword" label="Ulangi password baru">
          <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required />
        </Field>
      </FormCard>
      <FormActions submitLabel="Simpan password" cancelHref="/menu" />
    </form>
  );
}
