"use client";

import { useSyncExternalStore } from "react";
import type { Agent } from "@/types/agent";
import AgentCard from "./agent-card";
import {
  getStoredCreatedAgentsSnapshot,
  mergePublishedAgents,
  subscribeCreatedAgentsStore,
} from "@/lib/created-agents";

type PublishedAgentsGridProps = {
  staticAgents: Agent[];
};

export default function PublishedAgentsGrid({ staticAgents }: PublishedAgentsGridProps) {
  useSyncExternalStore(subscribeCreatedAgentsStore, getStoredCreatedAgentsSnapshot, () => "[]");

  const agents = mergePublishedAgents(staticAgents);

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {agents.map((agent) => (
        <AgentCard key={agent.slug} agent={agent} />
      ))}
    </div>
  );
}
