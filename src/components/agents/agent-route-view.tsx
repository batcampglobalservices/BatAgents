"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { agents as staticAgents } from "@/data/agents";
import AgentProfile from "./agent-profile";
import RatingForm from "./rating-form";
import AgentChat from "@/components/chat/agent-chat";
import {
  getPublishedAgentBySlug,
  getStoredCreatedAgentsSnapshot,
  subscribeCreatedAgentsStore,
} from "@/lib/created-agents";

type AgentRouteViewProps = {
  agentId: string;
  mode: "profile" | "chat";
  initialAgent?: typeof staticAgents[number] | null;
};

export default function AgentRouteView({ agentId, mode, initialAgent }: AgentRouteViewProps) {
  const createdAgentsSnapshot = useSyncExternalStore(
    subscribeCreatedAgentsStore,
    getStoredCreatedAgentsSnapshot,
    () => "[]",
  );
  const agent = useMemo(
    () => getPublishedAgentBySlug(staticAgents, agentId) ?? initialAgent ?? null,
    [agentId, createdAgentsSnapshot, initialAgent],
  );

  if (!agent) {
    return <NotFoundState agentId={agentId} />;
  }

  if (mode === "chat") {
    return <AgentChat agent={agent} />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <div className="space-y-6">
        <AgentProfile agent={agent} />
        <RatingForm agent={agent} />
      </div>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            0G proof trail
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            <li>Agent metadata proof stored on 0G.</li>
            <li>Task records can become proof receipts.</li>
            <li>Reputation can be attached to verifiable storage.</li>
            <li>Onchain payment support stays available on Starknet Sepolia.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            Network note
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Pay on Starknet Sepolia testnet to unlock the agent chat. 0G remains the
            storage and proof layer while onchain payment support is now real.
          </p>
        </div>
      </aside>
    </div>
  );
}

function NotFoundState({ agentId }: { agentId: string }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Not found</p>
      <h1 className="mt-4 text-3xl font-semibold text-white">Agent not found</h1>
      <p className="mt-3 text-sm leading-6 text-slate-300">
        No live agent matches <span className="font-mono">{agentId}</span>.
      </p>
      <Link
        href="/create-agent"
        className="mt-6 inline-flex items-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
      >
        Create an agent
      </Link>
    </div>
  );
}
