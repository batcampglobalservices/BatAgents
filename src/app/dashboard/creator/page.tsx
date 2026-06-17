import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Coins, Sparkles, Wallet } from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import ActivityOverview from "@/components/dashboard/activity-overview";
import AgentTable from "@/components/dashboard/agent-table";
import ProofCard from "@/components/0g/proof-card";
import LiveProofLog from "@/components/0g/live-proof-log";
import LivePaymentLedger from "@/components/payments/live-payment-ledger";
import { creatorDashboardData } from "@/data/dashboard";
import { getMockUserByRole } from "@/data/users";
import { agents } from "@/data/agents";
import { getDashboardStats } from "@/lib/db/dashboard";
import type { DashboardNavItem } from "@/components/dashboard/dashboard-sidebar";

const navItems = [
  { href: "/dashboard/creator", label: "Overview", description: "Creator status, earnings, and proof coverage.", icon: <Sparkles className="h-4 w-4" /> },
  { href: "/dashboard/creator#agents", label: "Agents", description: "Review every published agent and its status.", icon: <BadgeCheck className="h-4 w-4" /> },
  { href: "/dashboard/creator#proofs", label: "0G proofs", description: "Inspect stored metadata and receipts.", icon: <Coins className="h-4 w-4" /> },
  { href: "/dashboard/creator#earnings", label: "Earnings", description: "Follow revenue and marketplace support.", icon: <Wallet className="h-4 w-4" /> },
  { href: "/marketplace", label: "Marketplace", description: "See how your services appear to buyers.", icon: <ArrowUpRight className="h-4 w-4" /> },
] satisfies DashboardNavItem[];

const creator = getMockUserByRole("creator");

export default async function CreatorDashboardPage() {
  const dashboardStats = await getDashboardStats();

  return (
    <DashboardShell
      title="Creator dashboard"
      description="Monitor published agents, earnings, ratings, and decentralized proof coverage from one control room."
      user={creator}
      roleLabel="Creator"
      navItems={navItems}
      accentLabel="0G creator workspace"
    >
      <section className="rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 p-5">
        <p className="text-sm font-medium text-cyan-100">
          Built for 0G-powered AI agents with onchain payment support and future storage integration.
        </p>
      </section>

      <DashboardStats agents={agents} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Supabase agents", value: dashboardStats.totalAgents || creatorDashboardData.stats.totalAgents },
          { label: "Supabase hires", value: dashboardStats.totalHires || creatorDashboardData.stats.totalHires },
          { label: "Supabase proofs", value: dashboardStats.totalProofs || creatorDashboardData.stats.metadataProofs },
          { label: "Supabase reviews", value: dashboardStats.totalReviews || creatorDashboardData.stats.taskProofReceipts },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </section>

      <ActivityOverview title="Creator activity and proof records" />

      <LivePaymentLedger
        title="Earnings"
        description="Confirmed Starknet Sepolia payments and live revenue records."
        variant="creator"
      />

      <section id="agents" className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Published agents</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Marketplace-ready services</h2>
          </div>
          <Link href="/create-agent" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:bg-white/10">
            Create agent
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6">
          <AgentTable agents={agents} />
        </div>
      </section>

      <section id="proofs" className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">0G proofs</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Stored metadata proof samples</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Every published agent keeps a deterministic proof placeholder so the architecture is ready for real 0G uploads later.
          </p>
          <div className="mt-6 grid gap-4">
            {creatorDashboardData.proofHighlights.map(({ agentName, proof }) => (
              <ProofCard
                key={`${agentName}-${proof.rootHash}`}
                proofType={`${agentName} metadata proof`}
                proof={proof}
                status="stored"
              />
            ))}
          </div>
        </div>

        <div id="earnings" className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Revenue</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Recent creator activity</h2>
          <div className="mt-6 space-y-3">
            {creatorDashboardData.recentActivity.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm leading-6 text-slate-300">
                {item}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/60 p-5">
            <p className="text-sm font-medium text-white">Creator summary</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Stat label="Total agents" value={String(creatorDashboardData.stats.totalAgents)} />
              <Stat label="Total hires" value={String(creatorDashboardData.stats.totalHires)} />
              <Stat label="Total earnings" value={`${creatorDashboardData.stats.totalEarnings} STRK`} />
              <Stat label="Average rating" value={creatorDashboardData.stats.averageRating.toFixed(1)} />
            </div>
          </div>
        </div>
      </section>

      <LiveProofLog title="Task and reputation receipts" />

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Onchain registrations</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Agent registration receipts</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Each published agent should have a Starknet Sepolia registration hash so the
          platform can verify the creator-owned contract state.
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {creatorDashboardData.registrationReceipts.map((receipt) => (
            <div key={receipt.txHash} className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">{receipt.agentName}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
                    BatAgents Cairo contract
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    receipt.status === "confirmed"
                      ? "bg-emerald-400/10 text-emerald-100"
                      : "bg-amber-400/10 text-amber-100"
                  }`}
                >
                  {receipt.status}
                </span>
              </div>
              <p className="mt-4 break-all font-mono text-xs text-slate-300">{receipt.txHash}</p>
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
