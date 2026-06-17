"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, LogIn, Menu } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { getDashboardPathForRole, getRoleLabel } from "@/lib/demo-auth";
import { getSupabaseSetupMessage, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import type { AppUser, UserRole } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import LogoMark from "@/components/brand/logo-mark";

const links = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/create-agent", label: "Create Agent" },
];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

function getClient() {
  if (!isSupabaseConfigured() || typeof window === "undefined") {
    return null;
  }

  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(() => !isSupabaseConfigured());
  const setupMessage = isSupabaseConfigured() ? null : getSupabaseSetupMessage();

  useEffect(() => {
    const supabase = getClient();
    if (!supabase) {
      return;
    }

    let mounted = true;

    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      const currentSession = data.session?.user ?? null;

      if (currentSession) {
        setUser({
          id: currentSession.id,
          name: currentSession.user_metadata?.full_name ?? currentSession.email ?? "BatAgents User",
          email: currentSession.email ?? "",
          role: (currentSession.user_metadata?.role as UserRole | undefined) ?? "buyer",
          joinedAt: currentSession.created_at,
        });
      } else {
        setUser(null);
      }

      setLoading(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!nextSession?.user) {
        setUser(null);
        return;
      }

      setUser({
        id: nextSession.user.id,
        name: nextSession.user.user_metadata?.full_name ?? nextSession.user.email ?? "BatAgents User",
        email: nextSession.user.email ?? "",
        role: (nextSession.user.user_metadata?.role as UserRole | undefined) ?? "buyer",
        joinedAt: nextSession.user.created_at,
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (pathname === "/") {
    return null;
  }

  const dashboardHref = user ? getDashboardPathForRole(user.role) : "/dashboard";
  const dashboardLabel = user ? `${getRoleLabel(user.role)} Dashboard` : "Dashboard";

  const handleLogout = async () => {
    const supabase = getClient();
    if (!supabase) {
      router.push("/login");
      return;
    }

    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/75 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <LogoMark />

        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-transparent px-4 py-2 text-sm text-slate-300 transition hover:border-white/10 hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={dashboardHref}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-cyan-400/30 hover:bg-white/10"
          >
            {dashboardLabel}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {setupMessage ? (
            <Badge className="hidden border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-100 sm:inline-flex">
              Setup required
            </Badge>
          ) : null}
          {user ? (
            <Badge className="hidden border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-100 sm:inline-flex">
              {getRoleLabel(user.role)}
            </Badge>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-white/10 bg-white/5 text-white hover:border-cyan-400/30 hover:bg-white/10"
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Loading" : user ? "Sign out" : "Login"}
          </Button>
          <Button asChild size="sm" className="hidden md:inline-flex">
            <Link href="/marketplace">
              Explore agents
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon-sm" className="border-white/10 bg-white/5 text-white">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="border-white/10 bg-slate-950 text-white">
                <SheetHeader>
                  <SheetTitle className="text-left text-white">
                    <LogoMark compact />
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 grid gap-3">
                  {links.map((link) => (
                    <Link key={link.href} href={link.href} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                      {link.label}
                    </Link>
                  ))}
                  <Link href={dashboardHref} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                    {dashboardLabel}
                  </Link>
                  <Link href="/marketplace" className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
                    Explore agents
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
