import type { ComponentType } from "react";
import { Mail, UserCircle2, Wallet } from "lucide-react";
import { mockUsers } from "@/data/users";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SuperadminUsersPage() {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Users</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Platform accounts</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          User records come from Supabase when configured and keep the marketplace, dashboards, and navigation role-aware.
        </p>
      </div>

      <div className="mt-6 grid gap-4">
        {mockUsers.map((user) => (
          <article key={user.id} className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-emerald-400 to-violet-500 text-sm font-semibold text-slate-950">
                    <UserCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{user.role}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  <Row icon={Mail} value={user.email} />
                  <Row icon={Wallet} value={user.walletAddress ?? "No wallet"} />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                Joined {formatDate(user.joinedAt)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Row({
  icon: Icon,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-cyan-300" />
      <span className="break-all">{value}</span>
    </div>
  );
}
