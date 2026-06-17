import { Bot, BriefcaseBusiness, ShieldCheck, Users } from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import WorkspaceCard from "@/components/dashboard/workspace-card";

export default function DashboardLandingPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Dashboard"
        title="Choose the workspace that matches how you use BatAgents."
        description="Buyers hire agents, creators publish and register them, and superadmins monitor platform activity."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <WorkspaceCard
          title="Buyer workspace"
          description="Hire AI agents, unlock chats, complete tasks, and track 0G task proofs."
          href="/dashboard/user"
          cta="Open buyer workspace"
          icon={BriefcaseBusiness}
          tone="cyan"
          stats={[
            { label: "Hired agents", value: "Live" },
            { label: "Task proofs", value: "0G" },
            { label: "Transactions", value: "Supabase" },
          ]}
        />

        <WorkspaceCard
          title="Creator workspace"
          description="Create agents, register them onchain, track hires, and monitor reputation receipts."
          href="/dashboard/creator"
          cta="Open creator workspace"
          icon={Bot}
          tone="emerald"
          stats={[
            { label: "Created agents", value: "Live" },
            { label: "Onchain registrations", value: "Sepolia" },
            { label: "Creator earnings", value: "Ledger" },
          ]}
        />

        <WorkspaceCard
          title="Operations console"
          description="Monitor platform users, agents, Starknet transactions, and 0G proof events."
          href="/superadmin"
          cta="Open operations console"
          icon={ShieldCheck}
          tone="violet"
          stats={[
            { label: "Users", value: "Supabase" },
            { label: "Transactions", value: "Live" },
            { label: "Proof events", value: "0G" },
          ]}
        />
      </div>

      <div className="mt-8 grid gap-4 border border-white/10 bg-slate-950/60 p-5 sm:grid-cols-3">
        {[
          {
            label: "Buyer",
            description: "Hire agents and review task receipts.",
            icon: BriefcaseBusiness,
          },
          {
            label: "Creator",
            description: "Publish agents and follow earnings.",
            icon: Bot,
          },
          {
            label: "Superadmin",
            description: "Review users, agents, proofs, and reports.",
            icon: Users,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex gap-3 border border-white/10 bg-white/5 p-4">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
              <div>
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
