import React from "react";
import { AgentCard, AgentCardProps } from "./AgentCard";
import { EmptyState } from "../ui/EmptyState";
import { Compass } from "lucide-react";

interface AgentGridProps {
  agents?: AgentCardProps[];
}

export const AgentGrid: React.FC<AgentGridProps> = ({ agents = [] }) => {
  if (agents.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          icon={<Compass className="w-10 h-10 text-brand/60" />}
          title="No Agents in Marketplace"
          description="We couldn't read any active agent listings from 0G Chain. Check back once smart contracts are deployed and creator wallets mint new Agentic IDs."
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
      {agents.map((agent) => (
        <AgentCard key={agent.id} {...agent} />
      ))}
    </div>
  );
};
