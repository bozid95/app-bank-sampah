import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronRight,
  FileSpreadsheet,
  KeyRound,
  ListOrdered,
  LogOut,
  ReceiptText,
  Settings,
  ShieldCheck,
  Tag,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const ICONS: Record<string, LucideIcon> = {
  users: Users,
  tag: Tag,
  in: ArrowDownToLine,
  out: ArrowUpFromLine,
  receipt: ReceiptText,
  shield: ShieldCheck,
  data: FileSpreadsheet,
  settings: Settings,
  list: ListOrdered,
  key: KeyRound,
};

export type MenuItem = { href: string; icon: string; title: string; sub?: string };

function MenuGroup({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <section className="mb-5">
      <h2 className="mb-2 px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</h2>
      <ul className="divide-y overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-foreground/5">
        {items.map((m) => {
          const Icon = ICONS[m.icon] ?? ListOrdered;
          return (
            <li key={m.href}>
              <a href={m.href} className="flex items-center gap-3 px-3.5 py-3 active:bg-muted">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <span className="grid min-w-0 flex-1">
                  <span className="text-sm font-semibold">{m.title}</span>
                  {m.sub && <span className="truncate text-xs text-muted-foreground">{m.sub}</span>}
                </span>
                <ChevronRight className="size-4 text-muted-foreground/60" />
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function MenuView({
  name,
  initials,
  subtitle,
  account,
  menuTitle,
  menu,
}: {
  name: string;
  initials: string;
  subtitle: string;
  account: { label: string; value: string }[] | null;
  menuTitle: string;
  menu: MenuItem[];
}) {
  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-5 flex items-center gap-4 rounded-3xl bg-brand-gradient p-5 text-primary-foreground shadow-lg shadow-black/10">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg font-bold ring-2 ring-white/30">
          {initials}
        </span>
        <div className="min-w-0">
          <div className="truncate text-lg font-semibold">{name}</div>
          <div className="truncate text-sm text-primary-foreground/80">{subtitle}</div>
        </div>
      </div>

      {account && (
        <section className="mb-5">
          <h2 className="mb-2 px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Data rekening</h2>
          <dl className="divide-y rounded-2xl bg-card px-4 shadow-sm ring-1 ring-foreground/5">
            {account.map((a) => (
              <div key={a.label} className="flex justify-between gap-4 py-3 text-sm">
                <dt className="text-muted-foreground">{a.label}</dt>
                <dd className="text-right font-medium">{a.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <MenuGroup title={menuTitle} items={menu} />
      <MenuGroup title="Keamanan" items={[{ href: '/menu/password', icon: 'key', title: 'Ubah password' }]} />

      <form method="post" action="/logout">
        <Button type="submit" variant="destructive" size="lg" className="h-11 w-full rounded-xl text-base">
          <LogOut /> Keluar
        </Button>
      </form>
    </div>
  );
}
