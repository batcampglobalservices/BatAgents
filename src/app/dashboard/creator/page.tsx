import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  Coins,
  Sparkles,
  Wallet,
  Layers3,
  TrendingUp,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import ActivityOverview from "@/components/dashboard/activity-overview";
import AgentTable from "@/components/dashboard/agent-table";
import ProofCard from "@/components/0g/proof-card";
import LiveProofLog from "@/components/0g/live-proof-log";
import LivePaymentLedger from "@/components/payments/live-payment-ledger";
import { getMockUserByRole } from "@/data/users";
import { getDashboardStats } from "@/lib/db/dashboard";
import { getAgents } from "@/lib/db/agents";
import type { DashboardNavItem } from "@/components/dashboard/dashboard-sidebar";

const navItems = [
  { href: "/dashboard/creator", label: "Overview", description: "Creator status, earnings, and proof coverage.", icon: <Sparkles className="h-4 w-4" /> },
  { href: "/dashboard/creator#agents", label: "Agents", description: "Review every published agent and its status.", icon: <BadgeCheck className="h-4 w-4" /> },
  { href: "/dashboard/creator#proofs", label: "0G proofs", description: "Inspect stored metadata and receipts.", icon: <Coins className="h-4 w-4" /> },
  { href: "/dashboard/creator#earnings", label: "Earnings", description: "Follow revenue and marketplace support.", icon: <Wallet className="h-4 w-4" /> },
  { href: "/create-agent", label: "Create agent", description: "Publish a new AI worker from the creator workspace.", icon: <ArrowUpRight className="h-4 w-4" /> },
] satisfies DashboardNavItem[];

const creator = getMockUserByRole("creator");

export default async function CreatorDashboardPage() {
  const dashboardStats = await getDashboardStats();
  const publishedAgents = await getAgents();
  const proofHighlights = publishedAgents.filter((agent) => agent.zeroGProof).slice(0, 3);
  const activeAgents = publishedAgents.slice(0, 6);
  const totalHires = publishedAgents.reduce((sum, agent) => sum + agent.completedJobs, 0);
  const totalEarnings = publishedAgents.reduce((sum, agent) => sum + agent.price * agent.completedJobs, 0);
  const averageRating =
    publishedAgents.length > 0
      ? publishedAgents.reduce((sum, agent) => sum + agent.rating, 0) / publishedAgents.length
      : 0;

  return (
    <DashboardShell
      title="Creator dashboard"
      description="Publish AI agents, track earnings, and keep every proof record tied to the real marketplace data."
      user={creator}
      roleLabel="Creator"
      navItems={navItems}
      accentLabel="Creator workspace"
    >
      <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-white/5 to-emerald-400/10 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200">Live creator view</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Build, publish, and monitor agents from one control room.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            The dashboard now reflects live published agents, stored 0G proofs, and onchain registration status instead of seeded demo cards.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/create-agent"
              className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Create agent
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:bg-white/10"
            >
              Open marketplace
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <MiniMetric label="Published agents" value={String(publishedAgents.length)} icon={Layers3} />
          <MiniMetric label="Onchain ready" value={String(publishedAgents.filter((agent) => agent.onchainRegistrationTxHash).length)} icon={BadgeCheck} />
          <MiniMetric label="Average rating" value={averageRating.toFixed(1)} icon={TrendingUp} />
          <MiniMetric label="Live earnings" value={`${totalEarnings} STRK`} icon={Coins} />
        </div>
      </section>

      <DashboardStats agents={publishedAgents} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Supabase agents", value: dashboardStats.totalAgents || publishedAgents.length },
          { label: "Supabase hires", value: dashboardStats.totalHires || totalHires },
          { label: "Supabase proofs", value: dashboardStats.totalProofs || proofHighlights.length },
          { label: "Supabase reviews", value: dashboardStats.totalReviews || publishedAgents.filter((agent) => agent.rating > 0).length },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Published agents</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Live agent inventory</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              These rows come from the live agent store and update automatically when a creator publishes a new agent.
            </p>
          </div>
          <Link
            href="/create-agent"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:bg-white/10"
          >
            Create agent
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6">
          <AgentTable agents={publishedAgents} />
        </div>
      </section>

      <section id="proofs" className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">0G proofs</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Stored metadata proof samples</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Every live agent with metadata storage shows up here. When no proof exists yet, the empty state keeps the workflow honest.
          </p>
          <div className="mt-6 grid gap-4">
            {proofHighlights.length > 0 ? (
              proofHighlights.map(({ name, zeroGProof }) => (
                <ProofCard
                  key={`${name}-${zeroGProof?.rootHash}`}
                  proofType={`${name} metadata proof`}
                  proof={zeroGProof!}
                  status="stored"
                />
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/40 p-6 text-sm leading-6 text-slate-400">
                No 0G proofs yet. Publish an agent and upload metadata to see proof cards here.
              </div>
            )}
          </div>
        </div>

        <div id="earnings" className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Revenue</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Recent creator activity</h2>
          <div className="mt-6 space-y-3">
            {activeAgents.length > 0 ? (
              activeAgents.map((agent) => (
                <div key={agent.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm leading-6 text-slate-300">
                  {agent.name} is live with {agent.completedJobs} recorded hires and {agent.zeroGProof ? "stored 0G metadata" : "pending proof storage"}.
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-4 text-sm leading-6 text-slate-400">
                No published agents yet. Use the create-agent workspace to publish your first live AI worker.
              </div>
            )}
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/60 p-5">
            <p className="text-sm font-medium text-white">Creator summary</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Stat label="Total agents" value={String(publishedAgents.length)} />
              <Stat label="Total hires" value={String(totalHires)} />
              <Stat label="Total earnings" value={`${totalEarnings} STRK`} />
              <Stat label="Average rating" value={averageRating.toFixed(1)} />
            </div>
          </div>
        </div>
      </section>

      <LiveProofLog title="Task and reputation receipts" />

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Onchain registrations</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Agent registration receipts</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Registration hashes are shown when an agent has been published on Starknet Sepolia. Pending rows stay visible until the onchain step is complete.
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {publishedAgents.length > 0 ? (
            publishedAgents.map((agent, index) => (
              <div key={agent.id} className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white">{agent.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
                      {agent.category}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      agent.onchainRegistrationTxHash
                        ? "bg-emerald-400/10 text-emerald-100"
                        : index % 2 === 0
                          ? "bg-amber-400/10 text-amber-100"
                          : "bg-slate-400/10 text-slate-200"
                    }`}
                  >
                    {agent.onchainRegistrationTxHash ? "confirmed" : "pending"}
                  </span>
                </div>
                <p className="mt-4 break-all font-mono text-xs text-slate-300">
                  {agent.onchainRegistrationTxHash ?? `pending-${agent.id}`}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/40 p-6 text-sm leading-6 text-slate-400">
              No registration receipts yet. Create and publish an agent to generate the first live receipt.
            </div>
          )}
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

function MiniMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
      <Icon className="h-5 w-5 text-cyan-300" />
      <p className="mt-4 text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
