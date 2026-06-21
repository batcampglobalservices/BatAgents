"use client";

import React from "react";
import { useAccount } from "wagmi";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { EarningsPanel } from "@/components/dashboard/EarningsPanel";
import { AgentList } from "@/components/dashboard/AgentList";
import { Card } from "@/components/ui/Card";
import { Settings } from "lucide-react";

export default function CreatorDashboard() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center w-full">
        <Card hoverable={false} className="max-w-xl w-full border border-white/5 p-8 text-center space-y-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
            <Settings className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Wallet Connection Required</h3>
            <p className="text-sm text-white/50 leading-relaxed">
              Your creator profile is bound to your Web3 signature. Connect your wallet using the header button to review your published agents, metrics, and claimable royalties.
            </p>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 w-full">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Creator Dashboard</h1>
        <p className="text-white/50 text-sm">
          Track minted Agentic IDs, served compute analytics, and withdraw royalties.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsOverview />

      {/* Royalties Withdrawal Panel */}
      <EarningsPanel />

      {/* List of Created Agents */}
      <AgentList />
    </main>
  );
}
