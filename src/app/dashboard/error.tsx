"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, ArrowLeft, RefreshCcw } from "lucide-react";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("Dashboard route error:", error);
  }, [error]);

  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full rounded-[2rem] border border-rose-400/20 bg-white/5 p-6 shadow-[0_20px_80px_rgba(3,7,18,0.35)] backdrop-blur sm:p-8">
        <div className="flex items-center gap-3 text-rose-200">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-xs uppercase tracking-[0.35em]">Dashboard error</p>
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
          We could not load this dashboard section.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          The page hit a server-side issue while fetching auth or profile data. Your wallet, Supabase, and dashboard state are still intact, so retrying is safe.
        </p>

        <pre className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-xs leading-6 text-slate-300">
          {error.message}
        </pre>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            <RefreshCcw className="h-4 w-4" />
            Retry
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard home
          </Link>
        </div>
      </div>
    </section>
  );
}
