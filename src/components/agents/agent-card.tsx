import Link from "next/link";
import { ArrowRight, BadgeCheck, MessageSquareText, Star } from "lucide-react";
import type { Agent } from "@/types/agent";
import { cn } from "@/lib/utils";
import StatusBadge from "@/components/ui/status-badge";

type AgentCardProps = {
  agent: Agent;
  compact?: boolean;
};

export default function AgentCard({ agent, compact = false }: AgentCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 transition hover:border-cyan-400/30 hover:bg-slate-950",
        compact && "p-4",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            {agent.category}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">{agent.name}</h3>
        </div>
        <StatusBadge tone="emerald">
          {agent.currency} {agent.price}
        </StatusBadge>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-300">{agent.description}</p>

      <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-300">
        <StatusBadge tone="amber">
          <Star className="h-3.5 w-3.5 text-amber-300" />
          {agent.rating.toFixed(1)}
        </StatusBadge>
        <StatusBadge tone="cyan">
          <MessageSquareText className="h-3.5 w-3.5 text-cyan-300" />
          {agent.completedJobs} jobs
        </StatusBadge>
        <StatusBadge tone={agent.onchainRegistrationTxHash ? "emerald" : "amber"}>
          <BadgeCheck className="h-3.5 w-3.5 text-emerald-300" />
          {agent.onchainRegistrationTxHash ? "Onchain registered" : "Not registered"}
        </StatusBadge>
      </div>

      <div className="mt-6 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Creator</p>
          <p className="truncate text-sm text-slate-300">{agent.creator}</p>
          <p className="mt-1 text-xs text-slate-500">{agent.service}</p>
        </div>
        <Link
          href={`/agents/${agent.slug}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:bg-white/10"
        >
          View agent
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
