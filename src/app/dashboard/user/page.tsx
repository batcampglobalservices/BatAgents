import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  Bot,
  CalendarClock,
  Coins,
  CreditCard,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import ActivityOverview from "@/components/dashboard/activity-overview";
import ProofCard from "@/components/0g/proof-card";
import LiveProofLog from "@/components/0g/live-proof-log";
import LivePaymentLedger from "@/components/payments/live-payment-ledger";
import { getDashboardStats } from "@/lib/db/dashboard";
import { getAgents } from "@/lib/db/agents";
import { getWorkspaceUser } from "@/lib/db/profiles";
import type { DashboardNavItem } from "@/components/dashboard/dashboard-sidebar";

const navItems = [
  { href: "/dashboard/user", label: "Overview", description: "Buyer workspace and live task activity.", icon: <Sparkles className="h-4 w-4" /> },
  { href: "/dashboard/user#agents", label: "Hired agents", description: "Review the agents already on your roster.", icon: <Bot className="h-4 w-4" /> },
  { href: "/dashboard/user#proofs", label: "Task proofs", description: "Track completed work and saved receipts.", icon: <BadgeCheck className="h-4 w-4" /> },
  { href: "/dashboard/user#payments", label: "Payments", description: "Review Starknet Sepolia payment history.", icon: <CreditCard className="h-4 w-4" /> },
  { href: "/dashboard/user/history", label: "Usage history", description: "See transaction, hire, and proof trends.", icon: <CalendarClock className="h-4 w-4" /> },
  { href: "/marketplace", label: "Marketplace", description: "Hire more agents when you need them.", icon: <ShoppingBag className="h-4 w-4" /> },
] satisfies DashboardNavItem[];

export default async function BuyerDashboardPage() {
  const dashboardStats = await getDashboardStats();
  const publishedAgents = await getAgents();
  const buyer = await getWorkspaceUser("buyer");
  const activeAgents = publishedAgents.slice(0, 3);
  const proofAgents = publishedAgents.filter((agent) => agent.zeroGProof).slice(0, 3);
  const recommendedAgents = publishedAgents.slice(3, 6).length > 0 ? publishedAgents.slice(3, 6) : publishedAgents.slice(0, 3);
  const hiredAgentsCount = dashboardStats.totalHires || publishedAgents.length;
  const completedTasks = Math.max(publishedAgents.reduce((sum, agent) => sum + agent.completedJobs, 0), activeAgents.length);
  const proofCount = dashboardStats.totalProofs || proofAgents.length;
  const reviewCount = dashboardStats.totalReviews || publishedAgents.length;

  return (
    <DashboardShell
      title="Buyer dashboard"
      description="Track hired agents, live task outputs, payment history, and proof records from one focused workspace."
      user={buyer}
      roleLabel="Buyer"
      navItems={navItems}
      accentLabel="Buyer workspace"
    >
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-white/5 to-violet-400/10 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200">Buyer command center</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            See the agents you can hire, the work they have completed, and the receipts tied to each task.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            This dashboard now reflects live published agents and the active proof widgets instead of a fixed demo roster.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Browse marketplace
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/user/history"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:bg-white/10"
            >
              View usage history
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <MiniMetric label="Hired agents" value={String(hiredAgentsCount)} icon={Bot} />
          <MiniMetric label="Completed tasks" value={String(completedTasks)} icon={Sparkles} />
          <MiniMetric label="Reviews sent" value={String(reviewCount)} icon={BadgeCheck} />
          <MiniMetric label="0G proofs" value={String(proofCount)} icon={Coins} />
        </div>
      </section>

      <ActivityOverview title="Buyer activity and proof records" />

      <section id="agents" className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Hired agents</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Your active AI workers</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              The cards below are built from the live published agent list. When creators publish more agents, this section updates automatically.
            </p>
          </div>
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
            Browse agents
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {activeAgents.length > 0 ? (
            activeAgents.map((agent, index) => (
              <article key={agent.id} className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{agent.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">{agent.category}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    agent.zeroGProof
                      ? "bg-emerald-400/10 text-emerald-100"
                      : index % 2 === 0
                        ? "bg-amber-400/10 text-amber-100"
                        : "bg-slate-400/10 text-slate-200"
                  }`}>
                    {agent.zeroGProof ? "active" : "pending"}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">{agent.description}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Published {formatDate(agent.createdAt)}
                </div>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-cyan-100">
                    {agent.currency} {agent.price}
                  </p>
                  <Link
                    href={`/agents/${agent.slug}/chat`}
                    className="inline-flex items-center gap-1 rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    Open chat
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/40 p-6 text-sm leading-6 text-slate-400">
              No agents are published yet. Visit the creator workspace to publish an agent and make it available to buyers.
            </div>
          )}
        </div>
      </section>

      <section id="proofs" className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Task proofs</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Completed work ready for 0G</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Proof cards are sourced from the live agent list and the 0G proof widgets, so buyers can see what is already stored and what still needs publishing.
          </p>
          <div className="mt-6 grid gap-4">
            {proofAgents.length > 0 ? (
              proofAgents.map((agent) => (
                <div key={agent.id} className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{agent.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">{agent.service}</p>
                    </div>
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
                      0G ready
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-400">
                    {agent.zeroGProof ? "Metadata is already stored on 0G." : "This agent still needs a metadata proof."}
                  </p>
                  {agent.zeroGProof ? (
                    <div className="mt-4">
                      <ProofCard proofType={`${agent.name} metadata proof`} proof={agent.zeroGProof} status="stored" />
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/40 p-6 text-sm leading-6 text-slate-400">
                No 0G proofs yet. Publish agents with metadata storage to populate this section.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Recent chats</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Conversation trail</h2>
            <div className="mt-6 space-y-3">
              {publishedAgents.length > 0 ? (
                publishedAgents.slice(0, 3).map((agent) => (
                  <div key={`${agent.slug}-chat`} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-white">{agent.name}</p>
                      <span className="text-xs text-slate-500">{formatDate(agent.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {agent.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-4 text-sm leading-6 text-slate-400">
                  No chat history yet. Hire or create an agent to start a conversation trail.
                </div>
              )}
            </div>
          </section>

          <div id="payments">
            <LivePaymentLedger
              title="Payments"
              description="Real Starknet Sepolia payment records for this workspace."
              variant="buyer"
            />
          </div>

          <LiveProofLog title="Task and reputation receipts" />

          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Recommended</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">More agents to hire next</h2>
            <div className="mt-6 grid gap-3">
              {recommendedAgents.length > 0 ? (
                recommendedAgents.map((agent) => (
                  <Link
                    key={agent.id}
                    href={`/agents/${agent.slug}`}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4 transition hover:border-cyan-400/30 hover:bg-white/10"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{agent.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{agent.service}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-cyan-300" />
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 px-4 py-4 text-sm leading-6 text-slate-400">
                  No recommendations yet. When creators publish agents, they will appear here automatically.
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </DashboardShell>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
