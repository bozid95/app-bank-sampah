import {
  ChevronLeft,
  Home,
  LayoutGrid,
  Leaf,
  ListOrdered,
  Plus,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileAppBar({
  title,
  back,
  avatar,
}: {
  title: string;
  back?: string;
  avatar: string;
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-1.5 bg-primary px-2 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-2 text-primary-foreground transition-colors duration-150 dark:border-b dark:border-border/70 dark:bg-background/95 dark:text-foreground dark:backdrop-blur md:hidden print:hidden">
      {back ? (
        <a
          href={back}
          aria-label="Kembali"
          className="flex size-10 items-center justify-center rounded-full active:bg-white/15 dark:text-foreground/90 dark:active:bg-muted"
        >
          <ChevronLeft className="size-6" />
        </a>
      ) : (
        <span className="flex size-10 items-center justify-center text-primary-foreground dark:text-primary">
          <Leaf className="size-5" />
        </span>
      )}
      <span className="flex-1 truncate text-[17px] font-semibold">{title}</span>
      <a
        href="/menu"
        aria-label="Akun"
        className="mr-1 flex size-9 items-center justify-center rounded-full bg-white/20 text-xs font-bold ring-1 ring-white/30 dark:bg-primary/15 dark:text-primary dark:ring-primary/25"
      >
        {avatar}
      </a>
    </header>
  );
}

const ICONS: Record<string, LucideIcon> = {
  home: Home,
  users: Users,
  plus: Plus,
  list: ListOrdered,
  grid: LayoutGrid,
  user: User,
};

export type BottomNavItem = {
  href: string;
  label: string;
  icon: string;
  active: boolean;
  center?: boolean;
};

export function MobileBottomNav({ items }: { items: BottomNavItem[] }) {
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-30 grid border-t border-border/70 bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur transition-colors dark:border-border/80 dark:bg-card/95 dark:shadow-black/30 md:hidden print:hidden"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((item) => {
        const Icon = ICONS[item.icon] ?? Home;
        return (
          <a
            key={item.href}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors",
              item.active && "font-semibold text-primary",
            )}
          >
            {item.center ? (
              <span className="-mt-7 flex size-14 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-background dark:ring-card">
                <Icon className="size-7" />
              </span>
            ) : (
              <Icon
                className="size-[22px]"
                strokeWidth={item.active ? 2.4 : 2}
              />
            )}
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
