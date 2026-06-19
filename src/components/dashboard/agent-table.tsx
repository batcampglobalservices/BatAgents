"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ArrowUpRight, CircleOff, MessageSquareText, Sparkles } from "lucide-react";
import { useAccount, useProvider } from "@starknet-react/core";
import { toast } from "sonner";
import type { Agent } from "@/types/agent";
import { BATAGENTS_CONTRACT_ADDRESS, isContractConfigured } from "@/lib/contracts";
import { registerAgentOnchain } from "@/lib/starknet-contract";
import { waitForStarknetTransaction } from "@/lib/starknet-payments";
import {
  getStoredCreatedAgentsSnapshot,
  mergePublishedAgents,
  subscribeCreatedAgentsStore,
} from "@/lib/created-agents";
import { updateAgentListingStatus, updateAgentOnchainRegistration } from "@/lib/db/agents";

type AgentTableProps = {
  agents: Agent[];
};

export default function AgentTable({ agents }: AgentTableProps) {
  useSyncExternalStore(subscribeCreatedAgentsStore, getStoredCreatedAgentsSnapshot, () => "[]");
  const [busyAgentKey, setBusyAgentKey] = useState<{ id: string; action: "mint" | "listing" } | null>(null);
  const { account, isConnected } = useAccount();
  const provider = useProvider();

  const publishedAgents = mergePublishedAgents(agents);

  if (publishedAgents.length === 0) {
    return (
      <div className="border border-dashed border-white/10 bg-slate-950/40 p-8 text-center">
        <h3 className="text-lg font-semibold text-white">No published agents yet</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Creators can publish an agent from the create-agent workspace and it will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-white/10 bg-white/5">
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
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  agent.status === "unlisted"
                    ? "bg-amber-400/10 text-amber-100"
                    : "bg-emerald-400/10 text-emerald-200"
                }`}
              >
                {agent.status === "unlisted" ? "Unlisted" : "Listed"}
              </span>
              <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-slate-500">
                {agent.onchainRegistrationTxHash ? "Minted" : "Unminted"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/create-agent?edit=${agent.slug}`}
                className="inline-flex items-center gap-1 border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-cyan-400/30 hover:bg-white/10"
              >
                Edit
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href={`/agents/${agent.slug}/chat`}
                className="inline-flex items-center gap-1 border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-100 transition hover:border-cyan-400/30 hover:bg-cyan-400/15"
              >
                <MessageSquareText className="h-3.5 w-3.5" />
                Chat
              </Link>
              <button
                type="button"
                disabled={busyAgentKey?.id === agent.id || Boolean(agent.onchainRegistrationTxHash)}
                onClick={async () => {
                  if (!isConnected || !account) {
                    toast.error("Connect a Starknet wallet to mint this agent.");
                    return;
                  }

                  if (!isContractConfigured()) {
                    toast.error("BatAgents contract address is not configured.");
                    return;
                  }

                  const loadingToast = toast.loading("Preparing mint transaction...");
                  setBusyAgentKey({ id: agent.id, action: "mint" });

                  try {
                    const txHash = await registerAgentOnchain({
                      account,
                      agentSlug: agent.slug,
                      price: agent.price,
                    });

                    toast.loading("Waiting for Starknet confirmation...", {
                      id: loadingToast,
                    });

                    const status = await waitForStarknetTransaction(provider.provider, txHash);

                    if (status !== "accepted") {
                      throw new Error(
                        status === "rejected"
                          ? "Mint transaction was rejected."
                          : "Mint confirmation timed out on Starknet Sepolia.",
                      );
                    }

                    await updateAgentOnchainRegistration(agent.id, txHash, {
                      contractAddress: BATAGENTS_CONTRACT_ADDRESS,
                      nftTokenId: agent.onchainAgentId ?? agent.id,
                      status: "listed",
                    });
                    toast.success("Agent minted on Starknet Sepolia.", { id: loadingToast });
                  } catch (error) {
                    toast.error(
                      error instanceof Error ? error.message : "Minting failed.",
                      { id: loadingToast },
                    );
                  } finally {
                    setBusyAgentKey(null);
                  }
                }}
                className="inline-flex items-center gap-1 border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-100 transition hover:border-cyan-400/30 hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {busyAgentKey?.id === agent.id && busyAgentKey.action === "mint"
                  ? "Minting..."
                  : agent.onchainRegistrationTxHash
                    ? "Minted"
                    : "Mint agent"}
              </button>
              <button
                type="button"
                disabled={busyAgentKey?.id === agent.id}
                onClick={async () => {
                  setBusyAgentKey({ id: agent.id, action: "listing" });
                  try {
                    await updateAgentListingStatus(
                      agent.id,
                      agent.status === "unlisted" ? "listed" : "unlisted",
                    );
                  } finally {
                    setBusyAgentKey(null);
                  }
                }}
                className="inline-flex items-center gap-1 border border-white/10 bg-slate-950/60 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CircleOff className="h-3.5 w-3.5" />
                {busyAgentKey?.id === agent.id && busyAgentKey.action === "listing"
                  ? "Updating..."
                  : agent.status === "unlisted"
                    ? "List"
                    : "Unlist"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
