import { ArrowUpRight, BadgeCheck, Bot, CreditCard, ShoppingBag, Sparkles } from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import ActivityOverview from "@/components/dashboard/activity-overview";
import LiveProofLog from "@/components/0g/live-proof-log";
import ProofCard from "@/components/0g/proof-card";
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

export default async function BuyerProofsPage() {
  const buyer = await getWorkspaceUser("buyer");
  const agents = await getAgents();
  const proofAgents = agents.filter((agent) => agent.zeroGProof).slice(0, 4);

  return (
    <DashboardShell
      title="Buyer proofs"
      description="Separate proof records, usage receipts, and task activity into one dedicated view."
      user={buyer}
      roleLabel="Buyer"
      navItems={navItems}
      accentLabel="Buyer proofs"
    >
      <ActivityOverview title="Workspace activity" />

      <section className="border border-white/10 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Stored proofs</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">0G receipts and task evidence</h2>
        <div className="mt-6 grid gap-4">
          {proofAgents.length > 0 ? (
            proofAgents.map((agent) => (
              <div key={agent.id} className="border border-white/10 bg-slate-950/60 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{agent.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">{agent.service}</p>
                  </div>
                  <span className="border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
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
            <div className="border border-dashed border-white/10 bg-slate-950/40 p-6 text-sm leading-6 text-slate-400">
              No 0G proofs yet. Hire agents and save proof data to populate this section.
            </div>
          )}
        </div>
      </section>

      <LiveProofLog title="Task and reputation receipts" />
    </DashboardShell>
  );
}
