"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  useAccount, 
  useReadContract 
} from "wagmi";
import { AgentProfile } from "@/components/agent/AgentProfile";
import { PricingPanel } from "@/components/agent/PricingPanel";
import { ChatPanel } from "@/components/agent/ChatPanel";
import { ArrowLeft, Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatEther } from "viem";

const NFT_ADDRESS = (process.env.NEXT_PUBLIC_AGENT_NFT_ADDRESS || "0xBA3A7aAf2490bD66CB42ba74e8bf2c55e115E920") as `0x${string}`;
const MARKETPLACE_ADDRESS = (process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "0x378B76beE85dcc4998ED099ED3373C8438e73958") as `0x${string}`;

const NFT_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getAgent",
    outputs: [
      {
        components: [
          { internalType: "address", name: "creator", type: "address" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "category", type: "string" },
          { internalType: "string", name: "metadataURI", type: "string" },
          { internalType: "bytes32", name: "metadataHash", type: "bytes32" },
          { internalType: "bytes32", name: "encryptedDataHash", type: "bytes32" },
          { internalType: "bool", name: "active", type: "bool" },
          { internalType: "uint256", name: "createdAt", type: "uint256" }
        ],
        internalType: "struct BatAgentNFT.AgentData",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
] as const;

const MARKETPLACE_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "listings",
    outputs: [
      { internalType: "address", name: "seller", type: "address" },
      { internalType: "uint256", name: "price", type: "uint256" },
      { internalType: "uint256", name: "hourlyRateWei", type: "uint256" },
      { internalType: "bool", name: "active", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "buyer", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" }
    ],
    name: "hasAccess",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

export default function AgentDetailPage() {
  const params = useParams();
  const { address, isConnected } = useAccount();
  const idStr = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const tokenId = idStr ? BigInt(idStr) : BigInt(1);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch Agent data from BatAgentNFT
  const { data: agentData, isLoading: isLoadingAgent, refetch: refetchAgent } = useReadContract({
    address: NFT_ADDRESS,
    abi: NFT_ABI,
    functionName: "getAgent",
    args: [tokenId],
    query: {
      enabled: !!tokenId,
    }
  });

  // Fetch Marketplace listing details
  const { data: listing, isLoading: isLoadingListing, refetch: refetchListing } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "listings",
    args: [tokenId],
    query: {
      enabled: !!tokenId,
    }
  });

  // Fetch user access authorization
  const { data: hasAccessStatus, isLoading: isLoadingAccess, refetch: refetchAccess } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "hasAccess",
    args: address ? [address, tokenId] : undefined,
    query: {
      enabled: isConnected && !!address && !!tokenId,
    }
  });

  // Handle manual refetch on transaction completion
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    refetchAgent();
    refetchListing();
    refetchAccess();
  }, [refreshTrigger, refetchAgent, refetchListing, refetchAccess]);

  const hasAccess = !!hasAccessStatus;
  const isLoaded = !isLoadingAgent && !isLoadingListing && (!isConnected || !isLoadingAccess);

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <Loader2 className="w-12 h-12 text-brand animate-spin" />
        <p className="text-white/50 text-sm font-semibold">Resolving Agentic ID details from 0G Galileo Testnet...</p>
      </div>
    );
  }

  if (!agentData || !agentData.active) {
    return (
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex items-center justify-center w-full">
        <div className="text-center space-y-4 max-w-md">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Agent Not Found</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            The requested Agentic ID token is either inactive, does not exist, or was deleted from the BatAgentNFT registry.
          </p>
          <Link href="/marketplace">
            <Button size="sm" className="font-semibold">
              Return to Marketplace
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  // Parse listing details
  const buyoutPrice = listing && listing[3] && listing[1] > BigInt(0) ? formatEther(listing[1]) : undefined;
  const rentalPrice = listing && listing[3] && listing[2] > BigInt(0) ? formatEther(listing[2]) : undefined;

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 w-full">
      {/* Back button and Access Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link href="/marketplace">
          <Button variant="ghost" size="sm" className="flex items-center gap-1.5 -ml-3">
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Button>
        </Link>

        {hasAccess ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authorized — Active On-Chain Access Rights Detected</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Locked — On-Chain Rental or Buyout Required to Chat</span>
          </div>
        )}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Profile & Verification */}
        <div className="lg:col-span-2 space-y-8">
          <AgentProfile
            id={idStr || "1"}
            name={agentData.name}
            description={`${agentData.category} — ${agentData.metadataURI.includes("metadata/") ? "Configured on 0G testnet." : agentData.metadataURI}`}
            creator={agentData.creator}
            metadataHash={agentData.metadataHash}
            modelName="qwen2.5-omni"
          />
          {/* Chat Interface (permits chat if hasAccess is true) */}
          <ChatPanel hasAccess={hasAccess} agentName={agentData.name} modelName="qwen2.5-omni" />
        </div>

        {/* Right Side: Pricing Options */}
        <div>
          <PricingPanel
            tokenId={idStr || "1"}
            buyoutPrice={buyoutPrice}
            rentalPrice={rentalPrice}
            onSuccess={handleRefresh}
          />
        </div>
      </div>
    </main>
  );
}
