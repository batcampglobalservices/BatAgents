import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Bot, CreditCard, Sparkles, ShoppingBag } from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import { getDashboardStats } from "@/lib/db/dashboard";
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

export default async function BuyerDashboardPage() {
  const dashboardStats = await getDashboardStats();
  const agents = await getAgents();
  const buyer = await getWorkspaceUser("buyer");

  const summaryCards = [
    { label: "Hired agents", value: String(dashboardStats.totalHires || agents.length), icon: Bot },
    { label: "Task proofs", value: String(dashboardStats.totalProofs || 0), icon: BadgeCheck },
    { label: "Payments", value: String(dashboardStats.totalReviews || 0), icon: CreditCard },
    { label: "Marketplace", value: "Open", icon: ShoppingBag },
  ];

  return (
    <DashboardShell
      title="Buyer dashboard"
      description="This page is a summary hub. Open agents, proofs, payments, or history from the separate routes in the sidebar."
      user={buyer}
      roleLabel="Buyer"
      navItems={navItems}
      accentLabel="Buyer workspace"
    >
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Workspace summary</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Buyer activity is split across dedicated pages now.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Use the sidebar to move between the agent roster, proof records, payment ledger, and history view. The overview stays lightweight and readable.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/user/agents"
              className="inline-flex items-center gap-2 border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-400/30 hover:bg-cyan-400/15"
            >
              Open agents
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/user/history"
              className="inline-flex items-center gap-2 border border-white/10 bg-slate-950/60 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
            >
              View history
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {summaryCards.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="border border-white/10 bg-slate-950/60 p-5">
                <Icon className="h-5 w-5 text-cyan-300" />
                <p className="mt-4 text-sm text-slate-400">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                {index === 0 ? <p className="mt-2 text-xs text-slate-500">Live from the current workspace data.</p> : null}
              </div>
            );
          })}
        </div>
      </section>

      <DashboardStats agents={agents} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Agents", href: "/dashboard/user/agents", description: "Open the active roster." },
          { label: "Proofs", href: "/dashboard/user/proofs", description: "Check stored receipts." },
          { label: "Payments", href: "/dashboard/user/payments", description: "Review Starknet activity." },
          { label: "History", href: "/dashboard/user/history", description: "See the full timeline." },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="border border-white/10 bg-white/5 px-5 py-5 transition hover:border-cyan-400/30 hover:bg-white/10"
          >
            <p className="text-sm font-medium text-white">{item.label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
          </Link>
        ))}
      </section>
    </DashboardShell>
  );
}
