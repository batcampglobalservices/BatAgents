import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  CalendarClock,
  Coins,
  CreditCard,
  ShoppingBag,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import ActivityOverview from "@/components/dashboard/activity-overview";
import ProofCard from "@/components/0g/proof-card";
import LiveProofLog from "@/components/0g/live-proof-log";
import LivePaymentLedger from "@/components/payments/live-payment-ledger";
import { buyerDashboardData } from "@/data/dashboard";
import { getMockUserByRole } from "@/data/users";
import { getDashboardStats } from "@/lib/db/dashboard";
import type { DashboardNavItem } from "@/components/dashboard/dashboard-sidebar";

const navItems = [
  { href: "/dashboard/user", label: "Overview", description: "Buyer workspace and live task activity.", icon: <Sparkles className="h-4 w-4" /> },
  { href: "/dashboard/user#agents", label: "Hired agents", description: "Review the agents already on your roster.", icon: <Bot className="h-4 w-4" /> },
  { href: "/dashboard/user#proofs", label: "Task proofs", description: "Track completed work and saved receipts.", icon: <BadgeCheck className="h-4 w-4" /> },
  { href: "/dashboard/user#payments", label: "Payments", description: "Review Starknet Sepolia payment history.", icon: <CreditCard className="h-4 w-4" /> },
  { href: "/marketplace", label: "Marketplace", description: "Hire more agents when you need them.", icon: <ShoppingBag className="h-4 w-4" /> },
] satisfies DashboardNavItem[];

const buyer = getMockUserByRole("buyer");

export default async function BuyerDashboardPage() {
  const dashboardStats = await getDashboardStats();

  return (
    <DashboardShell
      title="Buyer dashboard"
      description="Manage hired agents, task outputs, payment history, and 0G proof receipts from one focused workspace."
      user={buyer}
      roleLabel="Buyer"
      navItems={navItems}
      accentLabel="Buyer workspace"
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Hired agents", value: dashboardStats.totalHires || buyerDashboardData.stats.hiredAgents, icon: Bot },
          { label: "Completed tasks", value: buyerDashboardData.stats.completedTasks, icon: Sparkles },
          { label: "Reviews sent", value: dashboardStats.totalReviews || buyerDashboardData.stats.reviewsSubmitted, icon: BadgeCheck },
          { label: "0G proofs", value: dashboardStats.totalProofs || buyerDashboardData.stats.zeroGProofs, icon: Coins },
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

      <ActivityOverview title="Local activity and proof records" />

      <section id="agents" className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Hired agents</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Your active AI workers</h2>
          </div>
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
            Browse agents
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {buyerDashboardData.hiredAgents.map(({ agent, hiredAt, status, lastChat }) => (
            <article key={agent.id} className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{agent.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">{agent.category}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  status === "active"
                    ? "bg-emerald-400/10 text-emerald-100"
                    : "bg-amber-400/10 text-amber-100"
                }`}>
                  {status}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">{lastChat}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <CalendarClock className="h-3.5 w-3.5" />
                Hired {formatDate(hiredAt)}
              </div>
              <div className="mt-5 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-cyan-100">{agent.currency} {agent.price}</p>
                <Link
                  href={`/agents/${agent.slug}/chat`}
                  className="inline-flex items-center gap-1 rounded-full bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Open chat
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="proofs" className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Task proofs</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Completed task proof ready for 0G</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Every completed task can be saved as a proof receipt so the work stays portable, auditable, and easy to review later.
          </p>
          <div className="mt-6 grid gap-4">
            {buyerDashboardData.completedTasks.map((task) => (
              <div key={task.id} className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{task.agentName}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">{task.result}</p>
                  </div>
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
                    0G ready
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-400">Completed {formatDate(task.completedAt)}</p>
                <div className="mt-4">
                  <ProofCard proofType="Task Proof Ready for 0G" proof={task.proof} status="stored" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Recent chats</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Conversation trail</h2>
            <div className="mt-6 space-y-3">
              {buyerDashboardData.recentChats.map((chat) => (
                <div key={`${chat.agent}-${chat.updatedAt}`} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-white">{chat.agent}</p>
                    <span className="text-xs text-slate-500">{formatDate(chat.updatedAt)}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{chat.summary}</p>
                </div>
              ))}
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
            <h2 className="mt-2 text-2xl font-semibold text-white">Other agents you can hire next</h2>
            <div className="mt-6 grid gap-3">
              {buyerDashboardData.recommendedAgents.map((agent) => (
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
              ))}
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
