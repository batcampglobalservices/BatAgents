"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { EmptyState } from "../ui/EmptyState";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { PlusSquare, Cpu, Coins, MessageSquare, ExternalLink, ArrowRight, ShieldCheck, ShieldAlert } from "lucide-react";
import Link from "next/link";

const NFT_ADDRESS = (process.env.NEXT_PUBLIC_AGENT_NFT_ADDRESS || "0xBA3A7aAf2490bD66CB42ba74e8bf2c55e115E920") as `0x${string}`;
const EXPLORER_URL = process.env.NEXT_PUBLIC_ZERO_G_EXPLORER_URL || "https://chainscan-galileo.0g.ai";

export interface CreatorAgent {
  id: string;
  name: string;
  model: string;
  status: "Listed" | "Unlisted";
  price?: string;       // buyout price in 0G
  rentalPrice?: string; // rental price in 0G/day
  chatsServed?: number;
}

interface AgentListProps {
  agents?: CreatorAgent[];
  isLoading?: boolean;
}

export const AgentList: React.FC<AgentListProps> = ({ agents = [], isLoading = false }) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white/70 uppercase">My Created Agents</h3>
        <Card hoverable={false} className="border border-white/5 p-8 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-white/50">Loading created agents...</span>
        </Card>
      </div>
    );
  }

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card
            key={agent.id}
            hoverable={true}
            className="flex flex-col justify-between p-5 border border-white/5 relative overflow-hidden group"
          >
            <div className="space-y-4">
              {/* Status Header */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-white/40">ID: #{agent.id}</span>
                {agent.status === "Listed" ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    Listed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <ShieldAlert className="w-3 h-3" />
                    Unlisted
                  </span>
                )}
              </div>

              {/* Title & Model */}
              <div className="space-y-1">
                <h3 className="font-bold text-white group-hover:text-brand transition-colors text-lg">
                  {agent.name}
                </h3>
                <div className="flex items-center gap-1 text-xs text-white/50">
                  <Cpu className="w-3.5 h-3.5 text-brand/60 shrink-0" />
                  <span className="font-mono text-[11px]">{agent.model}</span>
                </div>
              </div>

              {/* Stats & Pricing Details */}
              <div className="pt-2 space-y-2 border-t border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/40 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-sky-400/60" />
                    Chats Served:
                  </span>
                  <span className="font-semibold text-white">{agent.chatsServed ?? 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/40 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-emerald-400/60" />
                    Pricing:
                  </span>
                  <span className="font-semibold text-white">
                    {agent.price && parseFloat(agent.price) > 0 ? (
                      `Buyout: ${agent.price} 0G`
                    ) : agent.rentalPrice && parseFloat(agent.rentalPrice) > 0 ? (
                      `Rent: ${agent.rentalPrice} 0G/day`
                    ) : (
                      "Not priced"
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-white/5 flex gap-2">
              <a
                href={`${EXPLORER_URL}/token/${NFT_ADDRESS}/instance/${agent.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-1/2"
              >
                <Button variant="secondary" size="sm" className="w-full font-semibold gap-1 justify-center">
                  Verify
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
              <Link href={`/workspace/${agent.id}`} className="w-1/2">
                <Button variant="primary" size="sm" className="w-full font-semibold gap-1 justify-center">
                  Chat
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
