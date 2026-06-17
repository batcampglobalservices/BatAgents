"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LogIn, Sparkles } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import type { Session } from "@supabase/supabase-js";
import { getDashboardPathForRole, getRoleLabel } from "@/lib/demo-auth";
import { getSupabaseSetupMessage, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import type { AppUser, UserRole } from "@/types/user";

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
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupMessage, setSetupMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getClient();
    if (!supabase) {
      setSetupMessage(getSupabaseSetupMessage());
      setLoading(false);
      return;
    }

    let mounted = true;

    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      const currentSession = data.session ?? null;
      setSession(currentSession);

      if (currentSession?.user) {
        setUser({
          id: currentSession.user.id,
          name: currentSession.user.user_metadata?.full_name ?? currentSession.user.email ?? "BatAgents User",
          email: currentSession.user.email ?? "",
          role: (currentSession.user.user_metadata?.role as UserRole | undefined) ?? "buyer",
          joinedAt: currentSession.user.created_at,
        });
      } else {
        setUser(null);
      }

      setLoading(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);

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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 text-sm font-semibold tracking-tight text-white"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-emerald-400 to-violet-500 text-slate-950 shadow-lg shadow-cyan-500/20">
            <Sparkles className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-base">BatAgents</span>
            <span className="block text-xs font-normal text-slate-400">
              0G-powered AI marketplace
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={dashboardHref}
            className="rounded-full px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            {dashboardLabel}
          </Link>
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            Login
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {setupMessage ? (
            <span className="hidden rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-100 sm:inline-flex">
              Setup required
            </span>
          ) : null}
          {user ? (
            <span className="hidden rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-100 sm:inline-flex">
              {getRoleLabel(user.role)}
            </span>
          ) : null}
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Loading" : user ? "Sign out" : "Login"}
          </button>
          <Link
            href="/marketplace"
            className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400/40 hover:bg-white/10 md:inline-flex"
          >
            Explore agents
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
