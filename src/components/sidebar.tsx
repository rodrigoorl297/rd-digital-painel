"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  CircleUserRound,
  CreditCard,
  Database,
  LayoutDashboard,
  LogOut,
  Send,
} from "lucide-react";
import { user } from "@/lib/data";

const navItems = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/disparos", label: "Disparos", icon: Send },
  { href: "/listas", label: "Listas de Leads", icon: Database },
  { href: "/empresas", label: "Empresas", icon: Building2 },
  { href: "/creditos", label: "Créditos", icon: CreditCard },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="flex h-full min-h-0 w-[260px] shrink-0 flex-col bg-sidebar">
      <div className="flex shrink-0 flex-col items-center gap-0.5 border-b border-sidebar-border px-5 py-3">
        <div
          className="flex h-11 flex-col items-center justify-center leading-none"
          aria-label="RD Digital"
        >
          <span className="font-display text-[28px] font-bold tracking-tight">
            <span className="text-white">R</span>
            <span className="text-sidebar-activeText">D</span>
          </span>
          <span className="mt-0.5 text-[11px] font-semibold tracking-[0.28em] text-white">
            DIGITAL
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-sidebar">
        <nav
          aria-label="Navegação principal"
          className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4"
        >
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-all duration-150 ${
                  active
                    ? "border-l-2 border-sidebar-activeBorder bg-sidebar-activeBg pl-[10px] text-sidebar-activeText"
                    : "text-sidebar-muted hover:bg-sidebar-hoverBg hover:text-sidebar-foreground"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    active
                      ? "text-sidebar-activeText"
                      : "text-sidebar-muted group-hover:text-sidebar-foreground"
                  }`}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Ir para o perfil"
              className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sidebar-foreground/80 transition-all duration-150 hover:bg-sidebar-hoverBg hover:text-sidebar-foreground"
            >
              <span className="relative flex h-7 w-7 shrink-0 overflow-hidden rounded-full">
                <span className="flex h-full w-full items-center justify-center rounded-full bg-sidebar-hoverBg text-[11px] text-sidebar-foreground">
                  <CircleUserRound className="h-4 w-4" />
                </span>
              </span>
              <span className="truncate text-[13px] font-medium leading-tight">
                {user.displayName}
              </span>
            </button>
            <button
              type="button"
              aria-label="Sair"
              title="Sair"
              onClick={() => router.push("/login")}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sidebar-muted transition-all duration-150 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
