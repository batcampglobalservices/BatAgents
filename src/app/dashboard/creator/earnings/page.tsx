import { ArrowUpRight, BadgeCheck, Coins, Sparkles, Wallet } from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import LivePaymentLedger from "@/components/payments/live-payment-ledger";
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

export default async function CreatorEarningsPage() {
  const creator = await getWorkspaceUser("creator");
  const publishedAgents = await getAgents();
  const totalEarnings = publishedAgents.reduce((sum, agent) => sum + agent.price * agent.completedJobs, 0);

  return (
    <DashboardShell
      title="Creator earnings"
      description="Dedicated payment ledger for Starknet Sepolia revenue and transaction records."
      user={creator}
      roleLabel="Creator"
      navItems={navItems}
      accentLabel="Creator earnings"
    >
      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <LivePaymentLedger
          title="Earnings"
          description="Confirmed Starknet Sepolia payments and live revenue records."
          variant="creator"
        />
        <div className="border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Summary</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Live creator totals</h2>
          <div className="mt-6 grid gap-4">
            <div className="border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Published agents</p>
              <p className="mt-2 text-2xl font-semibold text-white">{publishedAgents.length}</p>
            </div>
            <div className="border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Estimated earnings</p>
              <p className="mt-2 text-2xl font-semibold text-white">{totalEarnings} STRK</p>
            </div>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
