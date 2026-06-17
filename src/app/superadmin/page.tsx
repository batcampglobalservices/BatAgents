import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Bot, Coins, Flag, ShieldCheck, Users } from "lucide-react";
import ProofCard from "@/components/0g/proof-card";
import ActivityOverview from "@/components/dashboard/activity-overview";
import LivePaymentLedger from "@/components/payments/live-payment-ledger";
import { superadminDashboardData } from "@/data/dashboard";
import { getDashboardStats } from "@/lib/db/dashboard";
import {
  BATAGENTS_CONTRACT_ADDRESS,
  PAYMENT_TOKEN_ADDRESS,
  isContractConfigured,
  isPaymentTokenConfigured,
} from "@/lib/contracts";

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function SuperadminPage() {
  const stats = superadminDashboardData.stats;
  const dashboardStats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 p-5">
        <p className="text-sm font-medium text-cyan-100">
          Supabase-backed platform governance, proof storage, and moderation flows are visible here.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total users", value: dashboardStats.totalUsers || stats.totalUsers, icon: Users },
          { label: "Total agents", value: dashboardStats.totalAgents || stats.totalAgents, icon: Bot },
          { label: "0G proofs", value: dashboardStats.totalProofs || stats.totalZeroGProofs, icon: BadgeCheck },
          { label: "Pending reports", value: stats.pendingReviews, icon: Flag },
          { label: "Platform volume", value: `${stats.totalVolume} STRK`, icon: Coins },
          { label: "Flagged agents", value: stats.flaggedAgents, icon: ShieldCheck },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <Icon className="h-5 w-5 text-cyan-300" />
              <p className="mt-4 text-sm text-slate-400">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
            </div>
          );
        })}
      </section>

      <ActivityOverview title="Local proof and review activity" />

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Onchain setup</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Contract configuration</h2>
          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <Row label="Contract" value={BATAGENTS_CONTRACT_ADDRESS || "Missing"} />
            <Row label="Payment token" value={PAYMENT_TOKEN_ADDRESS || "Missing"} />
            <Row label="Contract status" value={isContractConfigured() ? "Configured" : "Missing"} />
            <Row
              label="Token status"
              value={isPaymentTokenConfigured() ? "Configured" : "Missing"}
            />
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Platform notes</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">BatAgents Cairo contract</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            The marketplace now uses the BatAgents Cairo contract for hiring, with Sepolia
            testnet transactions and onchain hire proofs driving chat unlocks.
          </p>
          <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-50">
            Hire through BatAgents Cairo contract
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Platform users</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Recent users and roles</h2>
            </div>
            <Link href="/superadmin/users" className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
              Manage users
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {superadminDashboardData.recentUsers.slice(0, 3).map((user) => (
              <div key={user.email} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                  </div>
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
                    {user.role}
                  </span>
                </div>
                <p className="mt-3 text-xs text-slate-400">Joined {formatDate(user.joinedAt)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Proof queue</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Recent receipts on 0G</h2>
            </div>
            <Link href="/superadmin/proofs" className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
              Open proof log
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4">
            {superadminDashboardData.proofActivity.map((proof, index) => (
              <ProofCard
                key={`${proof.rootHash}-${index}`}
                proofType={index === 0 ? "Task proof" : "Reputation receipt"}
                proof={proof}
                status="stored"
              />
            ))}
          </div>
        </div>
      </section>

      <LivePaymentLedger
        title="Transactions"
        description="Starknet Sepolia transaction activity across the platform."
        variant="admin"
      />

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Reports</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Moderation queue</h2>
          </div>
          <Link href="/superadmin/reports" className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
            Open reports
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 space-y-3">
          {superadminDashboardData.reportsQueue.slice(0, 3).map((report) => (
            <div key={`${report.reportedAgent}-${report.reporter}`} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">{report.reportedAgent}</p>
                  <p className="mt-1 text-xs text-slate-500">{report.reporter}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  report.status === "resolved"
                    ? "bg-emerald-400/10 text-emerald-100"
                    : report.status === "reviewing"
                      ? "bg-cyan-400/10 text-cyan-100"
                      : "bg-amber-400/10 text-amber-100"
                }`}>
                  {report.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{report.reason}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
      <span className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</span>
      <span className="break-all text-right font-mono text-xs text-slate-200">{value}</span>
    </div>
  );
}
