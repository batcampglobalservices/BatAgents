"use client";

import React, { useState, useEffect } from "react";
import { FilterBar } from "@/components/marketplace/FilterBar";
import { AgentGrid } from "@/components/marketplace/AgentGrid";
import { AgentCardProps } from "@/components/marketplace/AgentCard";
import { usePublicClient } from "wagmi";
import { Loader2 } from "lucide-react";
import { formatEther } from "viem";

const NFT_ADDRESS = (process.env.NEXT_PUBLIC_AGENT_NFT_ADDRESS || "0xa51FabE8F60044A9db55A3874F2Ab37f8485bd11") as `0x${string}`;
const MARKETPLACE_ADDRESS = (process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "0x54c31DE1B30f572e6016655096a545a2299D518d") as `0x${string}`;

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
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ internalType: "address", name: "", type: "address" }],
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
  }
] as const;

export default function MarketplacePage() {
  const [listings, setListings] = useState<AgentCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient();

  useEffect(() => {
    async function fetchListings() {
      if (!publicClient) return;
      setIsLoading(true);
      const loadedListings: AgentCardProps[] = [];

      try {
        // Scan token IDs sequentially (up to 30) to reconstruct the decentralized marketplace state
        for (let i = 1; i <= 30; i++) {
          try {
            // Check if agent exists and read its data
            const agentData = await publicClient.readContract({
              address: NFT_ADDRESS,
              abi: NFT_ABI,
              functionName: "getAgent",
              args: [BigInt(i)],
            });

            if (!agentData || !agentData.active) continue;

            // Get the current owner of the token
            const owner = await publicClient.readContract({
              address: NFT_ADDRESS,
              abi: NFT_ABI,
              functionName: "ownerOf",
              args: [BigInt(i)],
            });

            // Read the marketplace listing details
            const listing = await publicClient.readContract({
              address: MARKETPLACE_ADDRESS,
              abi: MARKETPLACE_ABI,
              functionName: "listings",
              args: [BigInt(i)],
            });

            if (listing && listing[3]) {
              const isBuyout = listing[1] > BigInt(0);
              const formattedPrice = isBuyout ? formatEther(listing[1]) : formatEther(listing[2]);

              loadedListings.push({
                id: i.toString(),
                name: agentData.name,
                description: `${agentData.category} — ${agentData.metadataURI.includes("metadata/") ? "Configured on 0G testnet." : agentData.metadataURI}`,
                creator: agentData.creator,
                price: formattedPrice,
                pricingType: isBuyout ? "buyout" : "rental",
              });
            }
          } catch (err) {
            // Revert likely means token ID doesn't exist, we can stop scanning
            break;
          }
        }
      } catch (err) {
        console.error("Failed to read listings from chain:", err);
      } finally {
        setListings(loadedListings);
        setIsLoading(false);
      }
    }

    fetchListings();
  }, [publicClient]);

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 w-full">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Agent Marketplace
        </h1>
        <p className="text-white/50 text-sm max-w-xl">
          Purchase buyout, rental, or pay-per-message credits. All access rights are managed fully on-chain.
        </p>
      </div>

      {/* Controls & Grid */}
      <FilterBar />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-10 h-10 text-brand animate-spin" />
          <p className="text-white/50 text-sm font-medium">Resolving real listings from 0G Galileo Testnet...</p>
        </div>
      ) : (
        <AgentGrid agents={listings} />
      )}
    </main>
  );
}
