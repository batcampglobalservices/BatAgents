"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowUpRight, FileCheck2, PencilLine } from "lucide-react";
import type { Agent } from "@/types/agent";
import {
  getStoredCreatedAgentsSnapshot,
  mergePublishedAgents,
  subscribeCreatedAgentsStore,
} from "@/lib/created-agents";

type AgentTableProps = {
  agents: Agent[];
};

export default function AgentTable({ agents }: AgentTableProps) {
  useSyncExternalStore(subscribeCreatedAgentsStore, getStoredCreatedAgentsSnapshot, () => "[]");

  const publishedAgents = mergePublishedAgents(agents);

  if (publishedAgents.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/40 p-8 text-center">
        <h3 className="text-lg font-semibold text-white">No published agents yet</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Creators can publish an agent from the create-agent workspace and it will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
      <div className="grid grid-cols-[1.7fr_0.8fr_0.8fr_0.8fr_0.8fr_1fr_0.95fr_0.9fr] gap-4 border-b border-white/10 px-5 py-4 text-xs uppercase tracking-[0.3em] text-slate-400">
        <span>Agent</span>
        <span>Price</span>
        <span>Hires</span>
        <span>Rating</span>
        <span>Earnings</span>
        <span>0G Proof</span>
        <span>Status</span>
        <span>Actions</span>
      </div>
      <div className="divide-y divide-white/10">
        {publishedAgents.map((agent) => (
          <div
            key={agent.id}
            className="grid grid-cols-[1.7fr_0.8fr_0.8fr_0.8fr_0.8fr_1fr_0.95fr_0.9fr] gap-4 px-5 py-4 text-sm text-slate-200"
          >
            <div>
              <p className="font-medium text-white">{agent.name}</p>
              <p className="mt-1 text-xs text-slate-400">{agent.category}</p>
            </div>
            <div className="font-medium">
              {agent.currency} {agent.price}
            </div>
            <div>{agent.completedJobs}</div>
            <div>{agent.rating.toFixed(1)}</div>
            <div>
              {agent.currency} {Math.round(agent.price * agent.completedJobs)}
            </div>
            <div className="text-xs text-slate-300">
              {agent.zeroGProof ? (
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 font-medium text-emerald-100">
                  Stored on 0G
                </span>
              ) : (
                <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 font-medium text-amber-100">
                  Pending
                </span>
              )}
            </div>
            <div>
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                Active
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/10"
              >
                <PencilLine className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-100 transition hover:border-cyan-400/30 hover:bg-cyan-400/15"
              >
                <FileCheck2 className="h-3.5 w-3.5" />
                Proof
              </button>
              <Link
                href={`/agents/${agent.slug}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-cyan-300 transition hover:text-cyan-200"
              >
                Open
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
