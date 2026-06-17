import AgentTable from "@/components/dashboard/agent-table";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import { agents } from "@/data/agents";

export default function SuperadminAgentsPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Agents</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">All published AI workers</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Review each agent, its 0G proof coverage, and its marketplace readiness from the operations console.
        </p>
      </div>

      <DashboardStats agents={agents} />

      <AgentTable agents={agents} />
    </section>
  );
}
