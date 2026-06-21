import React from "react";
import Link from "next/link";
import { AgentProfile } from "@/components/agent/AgentProfile";
import { PricingPanel } from "@/components/agent/PricingPanel";
import { ChatPanel } from "@/components/agent/ChatPanel";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AgentDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Layout preview model so the reviewer can see the UI layout
  const previewAgent = {
    id: id,
    name: "Galileo Assistant",
    description: "An advanced coding and smart contract assistant trained specifically on 0G chain specifications, storage client structures, and compute inference models.",
    creator: "0x22E03a6A89B950F1c82ec5e74F8eCa321a105296",
    metadataHash: "0x1111111111111111111111111111111111111111111111111111111111111111",
    modelName: "Qwen/Qwen2.5-72B-Instruct",
    buyoutPrice: "50",
    rentalPrice: "2",
    ppmPrice: "0.1",
  };

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 w-full">
      {/* Back button and Notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link href="/marketplace">
          <Button variant="ghost" size="sm" className="flex items-center gap-1.5 -ml-3">
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Button>
        </Link>

        <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Demo Preview — Dynamic on-chain resolution is stubbed</span>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Profile & Verification */}
        <div className="lg:col-span-2 space-y-8">
          <AgentProfile
            id={previewAgent.id}
            name={previewAgent.name}
            description={previewAgent.description}
            creator={previewAgent.creator}
            metadataHash={previewAgent.metadataHash}
            modelName={previewAgent.modelName}
          />
          {/* Chat Interface (hasAccess=false for preview overlay) */}
          <ChatPanel hasAccess={false} agentName={previewAgent.name} />
        </div>

        {/* Right Side: Pricing Options */}
        <div>
          <PricingPanel
            buyoutPrice={previewAgent.buyoutPrice}
            rentalPrice={previewAgent.rentalPrice}
            ppmPrice={previewAgent.ppmPrice}
          />
        </div>
      </div>
    </main>
  );
}
