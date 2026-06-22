"use client";

import React, { useState, useEffect } from "react";
import { useAccount, usePublicClient, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { EarningsPanel } from "@/components/dashboard/EarningsPanel";
import { AgentList, CreatorAgent } from "@/components/dashboard/AgentList";
import { Card } from "@/components/ui/Card";
import { Settings, Loader2, AlertCircle } from "lucide-react";
import { CONTRACT_ADDRESSES } from "@/config/contracts";
import { parseAbiItem, formatEther } from "viem";

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
  }
] as const;

const ROYALTIES_ABI = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "pendingBalanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

export default function CreatorDashboard() {
  const { isConnected, address } = useAccount();
  const publicClient = usePublicClient();

  // Dashboard Data State
  const [agents, setAgents] = useState<CreatorAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimableAmount, setClaimableAmount] = useState("0.00");
  const [withdrawnAmount, setWithdrawnAmount] = useState("0.00");
  const [totalEarnings, setTotalEarnings] = useState("—");
  const [totalChatsServed, setTotalChatsServed] = useState("—");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Wagmi Write hooks for withdrawal
  const { writeContract, data: txHash, error: writeError, isPending: isWritePending, reset: resetWrite } = useWriteContract();

  const handleWithdraw = () => {
    setErrorMessage(null);
    try {
      writeContract({
        address: CONTRACT_ADDRESSES.royalties as `0x${string}`,
        abi: ROYALTIES_ABI,
        functionName: "withdraw",
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to trigger withdrawal transaction.");
    }
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Track transaction results
  useEffect(() => {
    if (isConfirmed) {
      setRefreshTrigger((prev) => prev + 1);
      resetWrite();
    }
  }, [isConfirmed, resetWrite]);

  useEffect(() => {
    if (writeError) {
      setErrorMessage(writeError.message || "Transaction signature rejected or execution failed.");
    }
  }, [writeError]);

  // Load Dashboard Data
  useEffect(() => {
    async function loadData() {
      if (!publicClient || !address) return;
      setIsLoading(true);
      setErrorMessage(null);

      try {
        // 1. Fetch pending/claimable royalties balance
        let claimable = "0.00";
        try {
          const balance = await publicClient.readContract({
            address: CONTRACT_ADDRESSES.royalties as `0x${string}`,
            abi: ROYALTIES_ABI,
            functionName: "pendingBalanceOf",
            args: [address],
          });
          claimable = formatEther(balance);
        } catch (err) {
          console.error("Error fetching royalties balance:", err);
        }
        setClaimableAmount(claimable);

        // 2. Fetch past withdrawal events to sum up lifetime withdrawn earnings
        let totalWithdrawn = 0n;
        try {
          const withdrawals = await publicClient.getLogs({
            address: CONTRACT_ADDRESSES.royalties as `0x${string}`,
            event: parseAbiItem("event Withdrawal(address indexed account, uint256 amount)"),
            args: {
              account: address
            },
            fromBlock: 0n,
            toBlock: "latest"
          });
          for (const w of withdrawals) {
            if (w.args.amount) {
              totalWithdrawn += w.args.amount;
            }
          }
        } catch (err) {
          console.error("Error fetching withdrawal logs:", err);
        }
        const withdrawnStr = formatEther(totalWithdrawn);
        setWithdrawnAmount(withdrawnStr);

        // Calculate total earnings (claimable + withdrawn)
        const totalEarnedVal = parseFloat(claimable) + parseFloat(withdrawnStr);
        setTotalEarnings(totalEarnedVal.toFixed(2));

        // 3. Scan Token IDs 1 to 30 for agents created by this address
        const scanPromises = Array.from({ length: 30 }, (_, idx) => {
          const idVal = BigInt(idx + 1);
          return (async () => {
            try {
              const agentData = await publicClient.readContract({
                address: CONTRACT_ADDRESSES.agentNft as `0x${string}`,
                abi: NFT_ABI,
                functionName: "getAgent",
                args: [idVal],
              });

              if (!agentData || !agentData.active) return null;
              if (agentData.creator.toLowerCase() !== address.toLowerCase()) return null;

              // Fetch listing details
              let isListed = false;
              let price = "";
              let rentalPrice = "";
              try {
                const listing = await publicClient.readContract({
                  address: CONTRACT_ADDRESSES.marketplace as `0x${string}`,
                  abi: MARKETPLACE_ABI,
                  functionName: "listings",
                  args: [idVal],
                });
                isListed = listing.active;
                price = formatEther(listing.price);
                rentalPrice = formatEther(listing.hourlyRateWei * 24n); // Daily rate
              } catch (err) {
                console.error(`Error querying listing for token ${idVal}:`, err);
              }

              // Fetch total chats served (logs from UsageTracker)
              let chatsServed = 0;
              try {
                const logs = await publicClient.getLogs({
                  address: CONTRACT_ADDRESSES.usageTracker as `0x${string}`,
                  event: parseAbiItem("event UsageRecorded(uint256 indexed tokenId, address indexed user, uint256 timestamp, uint256 approxTokens)"),
                  args: {
                    tokenId: idVal
                  },
                  fromBlock: 0n,
                  toBlock: "latest"
                });
                chatsServed = logs.length;
              } catch (err) {
                console.error(`Error querying usage logs for token ${idVal}:`, err);
              }

              // Fetch metadata model fallback
              let model = "qwen2.5-omni";
              try {
                if (agentData.metadataURI && agentData.metadataURI.startsWith("http")) {
                  const res = await fetch(agentData.metadataURI);
                  if (res.ok) {
                    const json = await res.json();
                    if (json.model) {
                      model = json.model;
                    }
                  }
                }
              } catch (err) {
                console.error(`Error loading metadata for token ${idVal}:`, err);
              }

              return {
                id: idVal.toString(),
                name: agentData.name,
                model,
                status: isListed ? ("Listed" as const) : ("Unlisted" as const),
                price,
                rentalPrice,
                chatsServed
              };
            } catch (err) {
              return null;
            }
          })();
        });

        const results = await Promise.all(scanPromises);
        const filteredAgents = results.filter((a): a is CreatorAgent => a !== null);
        setAgents(filteredAgents);

        // Sum up total chats served
        const totalUsage = filteredAgents.reduce((sum, a) => sum + (a.chatsServed || 0), 0);
        setTotalChatsServed(totalUsage.toString());

      } catch (err) {
        console.error("Error loading creator dashboard data:", err);
        setErrorMessage("Failed to load on-chain dashboard metrics.");
      } finally {
        setIsLoading(false);
      }
    }

    if (isConnected && address) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [isConnected, address, publicClient, refreshTrigger]);

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
      <StatsOverview
        agentsCount={isLoading ? "—" : agents.length.toString()}
        totalEarnings={isLoading ? "—" : totalEarnings}
        totalUsage={isLoading ? "—" : totalChatsServed}
      />

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span><strong>Error:</strong> {errorMessage}</span>
        </div>
      )}

      {/* Royalties Withdrawal Panel */}
      <EarningsPanel
        claimableAmount={claimableAmount}
        withdrawnAmount={withdrawnAmount}
        onWithdraw={handleWithdraw}
        isClaiming={isWritePending || isConfirming}
      />

      {/* List of Created Agents */}
      <AgentList agents={agents} isLoading={isLoading} />
    </main>
  );
}
