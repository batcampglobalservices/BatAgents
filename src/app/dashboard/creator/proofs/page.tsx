import { ArrowUpRight, BadgeCheck, Coins, Sparkles, Wallet } from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import LiveProofLog from "@/components/0g/live-proof-log";
import ProofCard from "@/components/0g/proof-card";
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

export default async function CreatorProofsPage() {
  const publishedAgents = await getAgents();
  const creator = await getWorkspaceUser("creator");
  const proofHighlights = publishedAgents.filter((agent) => agent.zeroGProof).slice(0, 4);

  return (
    <DashboardShell
      title="Creator proofs"
      description="Dedicated page for metadata proofs, receipts, and proof-related activity."
      user={creator}
      roleLabel="Creator"
      navItems={navItems}
      accentLabel="Creator proofs"
    >
      <section className="border border-white/10 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Stored metadata</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          Proof records are isolated from the agent inventory.
        </h1>
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
            <div className="border border-dashed border-white/10 bg-slate-950/40 p-6 text-sm leading-6 text-slate-400">
              No 0G proofs yet. Publish an agent and upload metadata to populate this page.
            </div>
          )}
        </div>
      </section>

      <LiveProofLog title="Task and reputation receipts" />
    </DashboardShell>
  );
}
