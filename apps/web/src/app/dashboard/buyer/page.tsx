"use client";

import React, { useState, useEffect } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useRouter } from "next/navigation";
import { MessageSquare, Settings, Loader2, Clock, Calendar, ArrowRight, ShieldCheck, ShieldAlert } from "lucide-react";
import Link from "next/link";

const NFT_ADDRESS = (process.env.NEXT_PUBLIC_AGENT_NFT_ADDRESS || "0xBA3A7aAf2490bD66CB42ba74e8bf2c55e115E920") as `0x${string}`;
const MARKETPLACE_ADDRESS = (process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "0x378B76beE85dcc4998ED099ED3373C8438e73958") as `0x${string}`;
const ACCESS_CONTROL_ADDRESS = (process.env.NEXT_PUBLIC_ACCESS_CONTROL_ADDRESS || "0xDC140d2B1429878D81F1CB65ab134839d01aB29A") as `0x${string}`;

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

const ACCESS_ABI = [
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

const MARKETPLACE_HIRE_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "address", name: "", type: "address" }
    ],
    name: "hiredUntil",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

const ACCESS_CONTROL_RENT_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "address", name: "", type: "address" }
    ],
    name: "rentedUntil",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

interface AuthorizedAgent {
  id: string;
  name: string;
  category: string;
  creator: string;
  expiresAt: number; // timestamp in seconds, 0 if unlimited
  isOwner: boolean;
  isActive: boolean;
}

export default function BuyerDashboard() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const publicClient = usePublicClient();
  const [agents, setAgents] = useState<AuthorizedAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function scanAuthorizedAgents() {
      if (!publicClient || !address) return;
      setIsLoading(true);
      const loaded: AuthorizedAgent[] = [];

      try {
        // Scan token IDs 1 to 30
        for (let i = 1; i <= 30; i++) {
          try {
            // Check if agent exists
            const agentData = await publicClient.readContract({
              address: NFT_ADDRESS,
              abi: NFT_ABI,
              functionName: "getAgent",
              args: [BigInt(i)],
            });

            if (!agentData || !agentData.active) continue;

            const owner = await publicClient.readContract({
              address: NFT_ADDRESS,
              abi: NFT_ABI,
              functionName: "ownerOf",
              args: [BigInt(i)],
            });

            const isOwner = owner.toLowerCase() === address.toLowerCase();

            // Check if buyer has access in Marketplace
            let hasAccessMarketplace = false;
            try {
              hasAccessMarketplace = await publicClient.readContract({
                address: MARKETPLACE_ADDRESS,
                abi: ACCESS_ABI,
                functionName: "hasAccess",
                args: [address, BigInt(i)],
              });
            } catch {}

            // Check if buyer has access in AccessControl
            let hasAccessControl = false;
            try {
              hasAccessControl = await publicClient.readContract({
                address: ACCESS_CONTROL_ADDRESS,
                abi: ACCESS_ABI,
                functionName: "hasAccess",
                args: [address, BigInt(i)],
              });
            } catch {}

            const hasAccess = isOwner || hasAccessMarketplace || hasAccessControl;

            // Fetch expiration details
            let expiresAt = 0;
            if (!isOwner) {
              let hiredUntilVal = BigInt(0);
              try {
                hiredUntilVal = await publicClient.readContract({
                  address: MARKETPLACE_ADDRESS,
                  abi: MARKETPLACE_HIRE_ABI,
                  functionName: "hiredUntil",
                  args: [BigInt(i), address],
                });
              } catch {}

              let rentedUntilVal = BigInt(0);
              try {
                rentedUntilVal = await publicClient.readContract({
                  address: ACCESS_CONTROL_ADDRESS,
                  abi: ACCESS_CONTROL_RENT_ABI,
                  functionName: "rentedUntil",
                  args: [BigInt(i), address],
                });
              } catch {}

              const maxVal = hiredUntilVal > rentedUntilVal ? hiredUntilVal : rentedUntilVal;
              expiresAt = Number(maxVal);
            }

            // We only show agents they own, have active access to, OR had access to in the past (expiresAt > 0)
            if (hasAccess || expiresAt > 0) {
              loaded.push({
                id: i.toString(),
                name: agentData.name,
                category: agentData.category,
                creator: agentData.creator,
                expiresAt,
                isOwner,
                isActive: isOwner || expiresAt * 1000 > Date.now(),
              });
            }
          } catch (err) {
            // Stop scanning once we hit nonexistent tokens
            break;
          }
        }
      } catch (err) {
        console.error("Error scanning authorized agents:", err);
      } finally {
        setAgents(loaded);
        setIsLoading(false);
      }
    }

    if (isConnected && address) {
      scanAuthorizedAgents();
    } else {
      setIsLoading(false);
    }
  }, [isConnected, address, publicClient]);

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
          Access your active workspaces, rental licenses, and owned Agentic IDs.
        </p>
      </div>

      {/* Access list */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white/70 uppercase">My Authorized Agents</h3>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
            <p className="text-white/40 text-xs font-semibold">Scanning 0G Galileo Testnet for your access credentials...</p>
          </div>
        ) : agents.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="w-10 h-10 text-brand/60" />}
            title="No Agent Access Detected"
            description="You haven't acquired access keys for any AI agents yet. Purchase a buyout, daily rental, or pre-fund PPM credits in the marketplace to unlock interactions."
            actionLabel="Browse Marketplace"
            onAction={() => router.push("/marketplace")}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card
                key={agent.id}
                hoverable={true}
                className="flex flex-col justify-between p-5 border border-white/5 relative overflow-hidden group"
              >
                <div className="space-y-4">
                  {/* Status Indicator */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-white/40">ID: #{agent.id}</span>
                    {agent.isActive ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                        <ShieldAlert className="w-3 h-3" />
                        Expired
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-white group-hover:text-brand transition-colors text-lg">
                      {agent.name}
                    </h3>
                    <p className="text-xs text-white/50">{agent.category}</p>
                  </div>

                  <div className="pt-2 flex items-center gap-2 text-xs text-white/40">
                    <Clock className="w-4 h-4 text-brand/60 shrink-0" />
                    <span>
                      {agent.isOwner ? (
                        <span className="font-semibold text-brand/80">Owner of Agentic ID</span>
                      ) : agent.isActive ? (
                        <>
                          Expires:{" "}
                          <span className="font-semibold text-white/80">
                            {new Date(agent.expiresAt * 1000).toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-red-400 font-semibold">Rental expired</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5">
                  <Link href={`/workspace/${agent.id}`} className="w-full block">
                    <Button
                      variant={agent.isActive ? "primary" : "secondary"}
                      size="sm"
                      className="w-full font-semibold gap-1.5"
                    >
                      {agent.isActive ? "Open Workspace" : "Renew / Purchase Access"}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
