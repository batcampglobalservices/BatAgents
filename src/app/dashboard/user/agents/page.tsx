import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Bot, CalendarClock, CreditCard, ShoppingBag, Sparkles } from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { getAgents } from "@/lib/db/agents";
import { getWorkspaceUser } from "@/lib/db/profiles";
import type { DashboardNavItem } from "@/components/dashboard/dashboard-sidebar";

const navItems = [
  { href: "/dashboard/user", label: "Overview", description: "Summary and workspace shortcuts.", icon: <Sparkles className="h-4 w-4" /> },
  { href: "/dashboard/user/agents", label: "Agents", description: "Browse hired agents and recommendations.", icon: <Bot className="h-4 w-4" /> },
  { href: "/dashboard/user/proofs", label: "Proofs", description: "Track receipts and 0G task proofs.", icon: <BadgeCheck className="h-4 w-4" /> },
  { href: "/dashboard/user/payments", label: "Payments", description: "Inspect live Starknet payment records.", icon: <CreditCard className="h-4 w-4" /> },
  { href: "/dashboard/user/history", label: "History", description: "Review usage trends and timeline data.", icon: <ArrowUpRight className="h-4 w-4" /> },
  { href: "/marketplace", label: "Marketplace", description: "Hire more agents when needed.", icon: <ShoppingBag className="h-4 w-4" /> },
] satisfies DashboardNavItem[];

export default async function BuyerAgentsPage() {
  const agents = await getAgents();
  const buyer = await getWorkspaceUser("buyer");
  const activeAgents = agents.slice(0, 4);
  const recommendedAgents = agents.slice(4, 8).length > 0 ? agents.slice(4, 8) : agents.slice(0, 4);

  return (
    <DashboardShell
      title="Buyer agents"
      description="Separate page for your active roster, recommended agents, and direct chat access."
      user={buyer}
      roleLabel="Buyer"
      navItems={navItems}
      accentLabel="Buyer agents"
    >
      <section className="border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Active roster</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Agents currently available to your workspace.
            </h1>
          </div>
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
            Browse marketplace
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {activeAgents.length > 0 ? (
            activeAgents.map((agent) => (
              <article key={agent.id} className="border border-white/10 bg-slate-950/60 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{agent.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">{agent.category}</p>
                  </div>
                  <span className="border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
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
                    className="inline-flex items-center gap-1 border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-100 transition hover:border-cyan-400/30 hover:bg-cyan-400/15"
                  >
                    Open chat
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="border border-dashed border-white/10 bg-slate-950/40 p-6 text-sm leading-6 text-slate-400">
              No agents are published yet. Visit the marketplace to hire one.
            </div>
          )}
        </div>
      </section>

      <section className="border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Recommendations</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Agents to consider next</h2>
          </div>
          <Link href="/dashboard/user/history" className="text-sm text-slate-300 transition hover:text-white">
            View history
          </Link>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {recommendedAgents.length > 0 ? (
            recommendedAgents.map((agent) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.slug}`}
                className="border border-white/10 bg-slate-950/60 px-4 py-4 transition hover:border-cyan-400/30 hover:bg-white/10"
              >
                <p className="text-sm font-medium text-white">{agent.name}</p>
                <p className="mt-1 text-xs text-slate-500">{agent.service}</p>
              </Link>
            ))
          ) : (
            <div className="border border-dashed border-white/10 bg-slate-950/40 px-4 py-4 text-sm leading-6 text-slate-400">
              No recommendations yet.
            </div>
          )}
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
