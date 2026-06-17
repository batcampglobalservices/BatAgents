"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { ArrowRight, Wallet, Sparkles } from "lucide-react";
import { getDashboardPathForRole } from "@/lib/demo-auth";
import type { UserRole } from "@/types/user";
import { getSupabaseBrowserClient, getSupabaseSetupMessage, isSupabaseConfigured } from "@/lib/supabase/client";
import { getProfileByEmail, upsertProfile } from "@/lib/db/profiles";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabaseConfigured = isSupabaseConfigured();

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
      <div className="flex flex-col justify-center">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium text-cyan-100">
          <Sparkles className="h-4 w-4" />
          Supabase auth enabled for live sign-in.
        </span>
        <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Sign in to the BatAgents workspace.
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-slate-300">
          Use your Supabase account to access the correct dashboard for your profile role.
        </p>

        {!supabaseConfigured ? (
          <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
            {getSupabaseSetupMessage()}
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Buyer", detail: "Hire agents and save task proofs." },
            { label: "Creator", detail: "Publish agents and track revenue." },
            { label: "Superadmin", detail: "Review platform health and reports." },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur"
            >
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <form
        className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(3,7,18,0.35)] backdrop-blur sm:p-8"
        onSubmit={(event) => {
          event.preventDefault();
          setLoading(true);
          setError(null);

          void (async () => {
            try {
              if (!supabaseConfigured) {
                throw new Error(getSupabaseSetupMessage());
              }

              const supabase = getSupabaseBrowserClient();
              if (!supabase) {
                throw new Error("Supabase client is unavailable.");
              }

              const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
              });

              if (authError || !data.user) {
                throw new Error(authError?.message || "Supabase login failed.");
              }

              const profile = await getProfileByEmail(data.user.email ?? email);
              const resolvedProfile =
                profile ??
                (await upsertProfile({
                  id: data.user.id,
                  email: data.user.email ?? email,
                  displayName: data.user.user_metadata?.full_name ?? data.user.email ?? email,
                  role: (data.user.user_metadata?.role as UserRole | undefined) ?? "buyer",
                }));

              const nextRole = resolvedProfile.role ?? "buyer";
              router.push(getDashboardPathForRole(nextRole));
            } catch (loginError) {
              setError(
                loginError instanceof Error
                  ? loginError.message
                  : "Login failed. Please check your credentials.",
              );
            } finally {
              setLoading(false);
            }
          })();
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Login</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Welcome back</h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300">
            Live auth
          </span>
        </div>

        <div className="mt-6 grid gap-4">
          <Field label="Email">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="you@batagents.com"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
            />
          </Field>

          <Field label="Password">
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="••••••••"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
            />
          </Field>

        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setWalletConnected(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:bg-white/10"
          >
            <Wallet className="h-4 w-4" />
            {walletConnected ? "Wallet connected" : "Connect wallet"}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          >
            {loading ? "Signing in..." : "Login"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-6 text-sm text-slate-400">
          New here?{" "}
          <Link href="/signup" className="font-medium text-cyan-300 hover:text-cyan-200">
            Create an account
          </Link>
        </p>
      </form>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-200">
      <span>{label}</span>
      {children}
    </label>
  );
}
