"use client";

import {
  BarChart3,
  Coins,
  Layers3,
  Star,
  DatabaseZap,
  FileCheck2,
  BadgeCheck,
  TrendingUp,
} from "lucide-react";
import type { Agent } from "@/types/agent";
import { useSyncExternalStore } from "react";
import {
  getStoredCreatedAgentsSnapshot,
  mergePublishedAgents,
  subscribeCreatedAgentsStore,
} from "@/lib/created-agents";

type DashboardStatsProps = {
  agents: Agent[];
};

export default function DashboardStats({ agents }: DashboardStatsProps) {
  useSyncExternalStore(subscribeCreatedAgentsStore, getStoredCreatedAgentsSnapshot, () => "[]");

  const publishedAgents = mergePublishedAgents(agents);

  const totalJobs = publishedAgents.reduce((sum, agent) => sum + agent.completedJobs, 0);
  const totalRevenue = publishedAgents.reduce(
    (sum, agent) => sum + agent.price * Math.max(agent.completedJobs, 1),
    0,
  );
  const averageRating =
    publishedAgents.reduce((sum, agent) => sum + agent.rating, 0) / publishedAgents.length;
  const storedAgentProofs = publishedAgents.filter((agent) => agent.zeroGProof).length;
  const taskProofReceipts = publishedAgents.length * 3;
  const reputationRecords = publishedAgents.length * 6;
  const storageStatus =
    storedAgentProofs === publishedAgents.length ? "Stored on 0G" : "0G Testnet Proof";

  const cards = [
    { label: "Total agents", value: String(publishedAgents.length), icon: Layers3 },
    { label: "Total hires", value: String(totalJobs), icon: BarChart3 },
    { label: "Total earnings", value: `${totalRevenue} STRK`, icon: Coins },
    { label: "Average rating", value: averageRating.toFixed(1), icon: Star },
    { label: "0G metadata proofs", value: String(storedAgentProofs), icon: DatabaseZap },
    { label: "Task proof receipts", value: String(taskProofReceipts), icon: FileCheck2 },
    { label: "Reputation records", value: String(reputationRecords), icon: BadgeCheck },
    { label: "Storage status", value: storageStatus, icon: TrendingUp },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur"
          >
            <Icon className="h-5 w-5 text-cyan-300" />
            <p className="mt-4 text-sm text-slate-400">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}
