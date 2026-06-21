"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { EmptyState } from "../ui/EmptyState";
import { Compass } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  description: string;
  avatarHash: string;
  creator: string;
  price: string;
}

interface FeaturedAgentsProps {
  agents?: Agent[];
}

export const FeaturedAgents: React.FC<FeaturedAgentsProps> = ({ agents = [] }) => {
  const router = useRouter();

  return (
    <section className="py-20 bg-white/[0.01] border-y border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Featured Agents
          </h2>
          <p className="text-white/50 text-sm sm:text-base">
            Discover active AI agents verified on-chain and ready for interaction.
          </p>
        </div>

        {/* Dynamic content */}
        {agents.length === 0 ? (
          <EmptyState
            icon={<Compass className="w-10 h-10 text-brand/60" />}
            title="No Featured Agents Yet"
            description="The marketplace currently has no active agent listings. Connect your wallet to create and list the very first AI agent."
            actionLabel="Browse Marketplace"
            onAction={() => router.push("/marketplace")}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* When connected, real cards will render here */}
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="glass-panel p-6 rounded-xl border border-white/5"
              >
                <h3 className="font-bold text-white">{agent.name}</h3>
                <p className="text-sm text-white/50">{agent.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
