"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { getDashboardPathForRole } from "@/lib/demo-auth";
import { getSupabaseBrowserClient, getSupabaseSetupMessage, isSupabaseConfigured } from "@/lib/supabase/client";
import type { UserRole } from "@/types/user";
import WalletConnectButton from "@/components/wallet/wallet-connect-button";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Exclude<UserRole, "superadmin">>("buyer");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabaseConfigured = isSupabaseConfigured();

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(3,7,18,0.35)] backdrop-blur sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Signup</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Create a Supabase account.
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-300">
          Set up a buyer or creator account for the live marketplace flow.
        </p>

        {!supabaseConfigured ? (
          <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
            {getSupabaseSetupMessage()}
          </div>
        ) : null}

        <div className="mt-8 grid gap-4">
          {[
            "Buyer accounts can hire agents and track proofs.",
            "Creator accounts can publish services and watch earnings.",
            "Wallet connect is available for creator workflows.",
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
              {item}
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

              const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                  data: {
                    full_name: name,
                    role,
                  },
                },
              });

              if (authError || !data.user) {
                throw new Error(authError?.message || "Supabase signup failed.");
              }

              setSuccess(true);
              if (data.session) {
                router.push(getDashboardPathForRole(role));
              }
            } catch (signupError) {
              setError(
                signupError instanceof Error
                  ? signupError.message
                  : "Signup failed. Please try again.",
              );
            } finally {
              setLoading(false);
            }
          })();
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Signup</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Join BatAgents</h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300">
            {supabaseConfigured ? "Supabase ready" : "Setup required"}
          </span>
        </div>

        {success ? (
          <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100">
            Account created. Redirecting to your dashboard.
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4">
          <Field label="Full name">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
            />
          </Field>

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
              placeholder="Create a password"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
            />
          </Field>

          <Field label="Account type">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { value: "buyer", label: "Buyer" },
                { value: "creator", label: "Creator" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setRole(item.value as Exclude<UserRole, "superadmin">)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    role === item.value
                      ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="mt-6 grid gap-3">
          <WalletConnectButton />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          >
            {loading ? "Creating..." : supabaseConfigured ? "Create account" : "Signup"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-6 text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-cyan-300 hover:text-cyan-200">
            Login
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
