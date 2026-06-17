import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Coins, Layers3, Sparkles, Wallet } from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import { getDashboardStats } from "@/lib/db/dashboard";
import { getAgents } from "@/lib/db/agents";
import { getWorkspaceUser } from "@/lib/db/profiles";
import type { DashboardNavItem } from "@/components/dashboard/dashboard-sidebar";

const navItems = [
  { href: "/dashboard/creator", label: "Overview", description: "Summary and workspace shortcuts.", icon: <Sparkles className="h-4 w-4" /> },
  { href: "/dashboard/creator/agents", label: "Agents", description: "Review published agents and actions.", icon: <BadgeCheck className="h-4 w-4" /> },
  { href: "/dashboard/creator/proofs", label: "Proofs", description: "Inspect stored metadata and receipts.", icon: <Coins className="h-4 w-4" /> },
  { href: "/dashboard/creator/earnings", label: "Earnings", description: "Follow live revenue and payment records.", icon: <Wallet className="h-4 w-4" /> },
  { href: "/create-agent", label: "Create agent", description: "Publish a new AI worker.", icon: <ArrowUpRight className="h-4 w-4" /> },
] satisfies DashboardNavItem[];

export default async function CreatorDashboardPage() {
  const dashboardStats = await getDashboardStats();
  const publishedAgents = await getAgents();
  const creator = await getWorkspaceUser("creator");

  const summaryCards = [
    { label: "Published agents", value: String(publishedAgents.length), icon: Layers3 },
    { label: "Onchain ready", value: String(publishedAgents.filter((agent) => agent.onchainRegistrationTxHash).length), icon: BadgeCheck },
    { label: "Average rating", value: publishedAgents.length > 0 ? (publishedAgents.reduce((sum, agent) => sum + agent.rating, 0) / publishedAgents.length).toFixed(1) : "0.0", icon: Sparkles },
    { label: "Live earnings", value: `${publishedAgents.reduce((sum, agent) => sum + agent.price * agent.completedJobs, 0)} STRK`, icon: Coins },
  ];

  return (
    <DashboardShell
      title="Creator dashboard"
      description="This page is a summary hub. Open agents, proofs, and earnings in separate routes to keep the workspace clear."
      user={creator}
      roleLabel="Creator"
      navItems={navItems}
      accentLabel="Creator workspace"
    >
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Workspace summary</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Creator activity is now separated into dedicated pages.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Use the sidebar to open agents, proof records, or earnings. The overview stays focused on status and shortcuts instead of every section at once.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/creator/agents"
              className="inline-flex items-center gap-2 border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-400/30 hover:bg-cyan-400/15"
            >
              Open agents
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/create-agent"
              className="inline-flex items-center gap-2 border border-white/10 bg-slate-950/60 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
            >
              Create agent
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
                {index === 0 ? <p className="mt-2 text-xs text-slate-500">Live from the current creator workspace data.</p> : null}
              </div>
            );
          })}
        </div>
      </section>

      <DashboardStats agents={publishedAgents} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Agents", href: "/dashboard/creator/agents", description: "Open the published inventory." },
          { label: "Proofs", href: "/dashboard/creator/proofs", description: "Review stored metadata." },
          { label: "Earnings", href: "/dashboard/creator/earnings", description: "Inspect payment records." },
          { label: "Create", href: "/create-agent", description: "Publish a new agent." },
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

      <section className="border border-white/10 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Platform stats</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Supabase agents", value: dashboardStats.totalAgents || publishedAgents.length },
            { label: "Supabase hires", value: dashboardStats.totalHires || 0 },
            { label: "Supabase proofs", value: dashboardStats.totalProofs || 0 },
            { label: "Supabase reviews", value: dashboardStats.totalReviews || 0 },
          ].map((item) => (
            <div key={item.label} className="border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
