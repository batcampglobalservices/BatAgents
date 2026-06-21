"use client";

import React from "react";
import { useAccount } from "wagmi";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useRouter } from "next/navigation";
import { MessageSquare, Settings } from "lucide-react";

export default function BuyerDashboard() {
  const { isConnected } = useAccount();
  const router = useRouter();

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
              Your agent authorizations are stored as on-chain access credentials. Connect your wallet using the header button to review your purchased, rented, or PPM-enabled assistants.
            </p>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 w-full">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Buyer Dashboard</h1>
        <p className="text-white/50 text-sm">
          Access your active rentals, owned Agentic IDs, and PPM messages.
        </p>
      </div>

      {/* Access list shell - empty state by default */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white/70 uppercase">My Authorized Agents</h3>
        
        <EmptyState
          icon={<MessageSquare className="w-10 h-10 text-brand/60" />}
          title="No Agent Access Detected"
          description="You haven't acquired access keys for any AI agents yet. Purchase a buyout, daily rental, or pre-fund PPM credits in the marketplace to unlock interactions."
          actionLabel="Browse Marketplace"
          onAction={() => router.push("/marketplace")}
        />
      </div>
    </main>
  );
}
