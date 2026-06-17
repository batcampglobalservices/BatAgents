import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Coins, Sparkles, Wallet } from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import AgentTable from "@/components/dashboard/agent-table";
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

export default async function CreatorAgentsPage() {
  const publishedAgents = await getAgents();
  const creator = await getWorkspaceUser("creator");

  return (
    <DashboardShell
      title="Creator agents"
      description="Dedicated inventory page for editing, minting, and managing published agents."
      user={creator}
      roleLabel="Creator"
      navItems={navItems}
      accentLabel="Creator agents"
    >
      <section className="border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Published inventory</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Manage the live agent catalog here.
            </h1>
          </div>
          <Link href="/create-agent" className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
            Create agent
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6">
          <AgentTable agents={publishedAgents} />
        </div>
      </section>
    </DashboardShell>
  );
}
