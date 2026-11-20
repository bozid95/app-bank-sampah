import type { ReactNode } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  FileSpreadsheet,
  Home,
  KeyRound,
  LayoutDashboard,
  Leaf,
  ListOrdered,
  LogOut,
  ReceiptText,
  Settings,
  ShieldCheck,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/format";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};
type NavGroup = { label: string; items: NavItem[] };

const ADMIN_NAV: NavGroup[] = [
  {
    label: "Ringkasan",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Transaksi",
    items: [
      {
        href: "/transactions/deposit",
        label: "Setor sampah",
        icon: ArrowDownToLine,
        exact: true,
      },
      {
        href: "/transactions/withdraw",
        label: "Tarik saldo",
        icon: ArrowUpFromLine,
        exact: true,
      },
      { href: "/transactions", label: "Riwayat transaksi", icon: ReceiptText },
    ],
  },
  {
    label: "Data",
    items: [
      { href: "/customers", label: "Nasabah", icon: Users },
      { href: "/waste-types", label: "Jenis & harga sampah", icon: Tag },
      { href: "/users", label: "Pengguna", icon: ShieldCheck },
    ],
  },
  {
    label: "Sistem",
    items: [
      { href: "/data", label: "Impor & ekspor", icon: FileSpreadsheet },
      { href: "/settings", label: "Pengaturan", icon: Settings },
    ],
  },
];

const CUSTOMER_NAV: NavGroup[] = [
  {
    label: "Rekening saya",
    items: [
      { href: "/me", label: "Beranda", icon: Home, exact: true },
      { href: "/me/statement", label: "Mutasi rekening", icon: ListOrdered },
      { href: "/me/prices", label: "Harga sampah", icon: Tag },
    ],
  },
];

const isActive = (path: string, item: NavItem) => {
  if (item.exact) return path === item.href;
  if (item.href === "/transactions")
    return path === "/transactions" || /^\/transactions\/\d+$/.test(path);
  return path === item.href || path.startsWith(item.href + "/");
};

interface Props {
  role: "ADMIN" | "USER";
  path: string;
  username: string;
  appName: string;
  organizationName: string;
  title: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export default function DesktopShell({
  role,
  path,
  username,
  appName,
  organizationName,
  title,
  actions,
  children,
}: Props) {
  const nav = role === "ADMIN" ? ADMIN_NAV : CUSTOMER_NAV;
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <a
            href="/"
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sidebar-foreground no-underline"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="size-5" />
            </span>
            <span className="grid leading-tight">
              <span className="truncate text-sm font-semibold">{appName}</span>
              <span className="truncate text-xs text-muted-foreground">
                {organizationName}
              </span>
            </span>
          </a>
        </SidebarHeader>

        <SidebarContent>
          {nav.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(path, item)}
                      >
                        <a href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
                {initials(username)}
              </AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 flex-1 leading-tight">
              <span className="truncate text-sm font-medium">{username}</span>
              <span className="truncate text-xs text-muted-foreground">
                {role === "ADMIN" ? "Administrator" : "Nasabah"}
              </span>
            </div>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={path === "/menu/password"}>
                <a href="/menu/password">
                  <KeyRound />
                  <span>Ubah password</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <form method="post" action="/logout">
                <SidebarMenuButton
                  type="submit"
                  className="text-destructive hover:text-destructive"
                >
                  <LogOut />
                  <span>Keluar</span>
                </SidebarMenuButton>
              </form>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0 bg-muted/40 md:bg-background">
        <header className="sticky top-0 z-10 hidden h-14 shrink-0 items-center gap-3 border-b bg-background/90 px-6 backdrop-blur md:flex">
          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground"
          >
            <span className="truncate">{appName}</span>
            <span aria-hidden="true">/</span>
            <span className="truncate font-medium text-foreground">
              {title}
            </span>
          </nav>
          <div className="ml-auto flex items-center gap-2">{actions}</div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
