import Link from "next/link";
import type { ComponentType } from "react";
import { CalendarDays, Coins, MessagesSquare, ShieldCheck, Star } from "lucide-react";
import type { Agent } from "@/types/agent";
import ProofCard from "@/components/0g/proof-card";
import StatusBadge from "@/components/ui/status-badge";

type AgentProfileProps = {
  agent: Agent;
};

export default function AgentProfile({ agent }: AgentProfileProps) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
      <div className="flex flex-col gap-6 border-b border-white/10 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="cyan">{agent.category}</StatusBadge>
            <StatusBadge tone={agent.zeroGProof ? "emerald" : "amber"}>
              {agent.zeroGProof ? "Stored on 0G" : "0G proof pending"}
            </StatusBadge>
            <StatusBadge tone={agent.onchainRegistrationTxHash ? "emerald" : "amber"}>
              {agent.onchainRegistrationTxHash ? "Onchain registered" : "Not registered"}
            </StatusBadge>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {agent.name}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            {agent.description}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:w-[340px]">
          <Stat icon={Star} label="Rating" value={agent.rating.toFixed(1)} />
          <Stat icon={Coins} label="Price" value={`${agent.currency} ${agent.price}`} />
          <Stat icon={MessagesSquare} label="Jobs" value={`${agent.completedJobs}`} />
          <Stat icon={CalendarDays} label="Launched" value={agent.createdAt} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            What this agent does
          </h2>
          <p className="mt-3 text-lg text-white">{agent.service}</p>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Use this agent for the task it is configured to solve. The chat unlocks
            only after the Starknet Sepolia contract confirms your hire.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            Creator and access
          </h2>
          <p className="mt-3 text-lg text-white">{agent.creator}</p>
          <p className="mt-2 text-sm text-slate-400">{agent.creatorWallet}</p>
          {agent.onchainRegistrationTxHash ? (
            <p className="mt-2 break-all font-mono text-xs text-cyan-200">
              Registration tx: {agent.onchainRegistrationTxHash}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/agents/${agent.slug}/chat`}
              className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Hire Agent
            </Link>
            <div className="inline-flex items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Onchain access
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            System prompt
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {agent.systemPrompt}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            Sample questions
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {agent.sampleQuestions.map((question) => (
              <li key={question} className="rounded-xl bg-white/5 px-4 py-3">
                {question}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {agent.zeroGProof ? (
        <div className="mt-6">
          <ProofCard
            proofType="Agent metadata proof"
            proof={agent.zeroGProof}
            status="stored"
          />
        </div>
      ) : null}

      <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-50">
        Starknet Sepolia testnet payment unlock is required before the live chat opens.
      </div>
    </section>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <Icon className="h-4 w-4 text-cyan-300" />
      <p className="mt-3 text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
