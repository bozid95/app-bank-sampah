import { Eye, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorAlert, Field } from './forms';

export function LoginView({
  appName,
  tagline,
  footer,
  username,
  error,
}: {
  appName: string;
  tagline: string;
  footer: string;
  username: string;
  error: string;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-brand-gradient px-5 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <div className="mb-6 text-center text-primary-foreground">
        <div className="mx-auto mb-3 flex size-20 items-center justify-center rounded-3xl bg-white text-primary shadow-xl shadow-black/15">
          <Leaf className="size-10" />
        </div>
        <div className="text-2xl font-extrabold tracking-tight">{appName}</div>
        {tagline && <div className="text-sm text-primary-foreground/85">{tagline}</div>}
      </div>

      <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-2xl shadow-black/20">
        <h1 className="mb-4 text-lg font-semibold">Masuk ke akun Anda</h1>
        <ErrorAlert message={error} />
        <form method="post" className="grid gap-4">
          <Field id="username" label="Username">
            <Input
              id="username"
              name="username"
              defaultValue={username}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
              autoFocus
              className="h-11"
            />
          </Field>
          <Field id="password" label="Password">
            <div className="relative">
              <Input id="password" name="password" type="password" autoComplete="current-password" required className="h-11 pr-11" />
              <button
                type="button"
                id="pw-toggle"
                aria-label="Tampilkan password"
                className="absolute top-1/2 right-1 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground data-[shown]:text-primary"
              >
                <Eye className="size-5" />
              </button>
            </div>
          </Field>
          <Button type="submit" size="lg" className="mt-2 h-11 w-full rounded-xl text-base">
            Masuk
          </Button>
        </form>
      </div>

      <p className="mt-5 max-w-sm text-center text-sm text-primary-foreground/85">{footer}</p>
    </div>
  );
}
