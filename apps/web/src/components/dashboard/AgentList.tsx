"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { EmptyState } from "../ui/EmptyState";
import { PlusSquare } from "lucide-react";

interface CreatorAgent {
  id: string;
  name: string;
  model: string;
  earnings: string;
  status: "Listed" | "Unlisted";
}

interface AgentListProps {
  agents?: CreatorAgent[];
}

export const AgentList: React.FC<AgentListProps> = ({ agents = [] }) => {
  const router = useRouter();

  if (agents.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white/70 uppercase">My Created Agents</h3>
        <EmptyState
          icon={<PlusSquare className="w-10 h-10 text-brand/60" />}
          title="No Created Agents"
          description="You haven't minted any Agentic IDs yet. Configure and deploy your first assistant to begin serving client requests."
          actionLabel="Create New Agent"
          onAction={() => router.push("/create")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white/70 uppercase">My Created Agents</h3>
      {/* Real list wrapper goes here when wired */}
    </div>
  );
};
