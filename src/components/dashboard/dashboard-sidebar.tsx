"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { AppUser } from "@/types/user";
import { cn } from "@/lib/utils";

export type DashboardNavItem = {
  href: string;
  label: string;
  description?: string;
  icon: ReactNode;
};

type DashboardSidebarProps = {
  user: AppUser;
  navItems: DashboardNavItem[];
  roleLabel: string;
};

export default function DashboardSidebar({
  user,
  navItems,
  roleLabel,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const theme =
    roleLabel.toLowerCase() === "creator"
      ? "from-violet-500/15 via-slate-950/80 to-cyan-500/10"
      : roleLabel.toLowerCase() === "buyer"
        ? "from-cyan-500/15 via-slate-950/80 to-emerald-500/10"
        : "from-amber-500/15 via-slate-950/80 to-rose-500/10";

  return (
    <aside className={`rounded-[2rem] border border-white/10 bg-gradient-to-b ${theme} p-5 shadow-[0_20px_80px_rgba(3,7,18,0.28)] backdrop-blur lg:sticky lg:top-24 lg:h-fit`}>
      <div className="rounded-2xl border border-white/10 bg-slate-950/65 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-emerald-400 to-violet-500 text-sm font-semibold text-slate-950">
            {user.name.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-cyan-100">
            {roleLabel}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
            Supabase session
          </span>
        </div>
      </div>

      <nav className="mt-5 space-y-2">
        {navItems.map((item) => {
          const normalizedHref = item.href.split("?")[0].split("#")[0];
          const active =
            pathname === normalizedHref || pathname.startsWith(`${normalizedHref}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-start gap-3 rounded-2xl border px-4 py-3 transition",
                active
                  ? "border-cyan-400/30 bg-cyan-400/10 text-white"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10",
              )}
            >
              <span className={cn("mt-0.5 shrink-0 text-slate-400", active && "text-cyan-300")}>
                {item.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{item.label}</span>
                {item.description ? (
                  <span className="mt-0.5 block text-xs leading-5 text-slate-400">
                    {item.description}
                  </span>
                ) : null}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
