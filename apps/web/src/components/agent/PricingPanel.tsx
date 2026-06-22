"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { 
  useAccount, 
  useWriteContract, 
  useWaitForTransactionReceipt 
} from "wagmi";
import { ShieldAlert, CreditCard, Clock, Coins, Loader2 } from "lucide-react";
import { parseEther, formatEther } from "viem";

interface PricingPanelProps {
  tokenId: string;
  buyoutPrice?: string;
  rentalPrice?: string; // Hourly rate in 0G
  ppmPrice?: string;
  onSuccess?: () => void;
}

const MARKETPLACE_ADDRESS = (process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "0x378B76beE85dcc4998ED099ED3373C8438e73958") as `0x${string}`;
const EXPLORER_URL = process.env.NEXT_PUBLIC_ZERO_G_EXPLORER_URL || "https://chainscan-galileo.0g.ai";

const MARKETPLACE_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "uint256", name: "durationSeconds", type: "uint256" }
    ],
    name: "hireAgent",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "bytes", name: "sealedKey", type: "bytes" },
      { internalType: "bytes", name: "proof", type: "bytes" }
    ],
    name: "purchase",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  }
] as const;

export const PricingPanel: React.FC<PricingPanelProps> = ({
  tokenId,
  buyoutPrice,
  rentalPrice = "0.5",
  ppmPrice,
  onSuccess,
}) => {
  const { isConnected } = useAccount();
  const [hireHours, setHireHours] = useState(4);
  const [isPendingTx, setIsPendingTx] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { writeContract, data: txResult, error: writeError, reset } = useWriteContract();

  const { isSuccess: isConfirmed, isLoading: isWaiting } = useWaitForTransactionReceipt({
    hash: txHash || undefined,
  });

  // Track Tx Hash
  useEffect(() => {
    if (txResult) {
      setTxHash(txResult);
      setIsPendingTx(false);
      reset();
    }
  }, [txResult, reset]);

  // Track Tx Confirmation
  useEffect(() => {
    if (isConfirmed) {
      setTxHash(null);
      if (onSuccess) onSuccess();
    }
  }, [isConfirmed, onSuccess]);

  // Track Tx Errors
  useEffect(() => {
    if (writeError) {
      setErrorMessage(writeError.message || "Transaction signature rejected.");
      setIsPendingTx(false);
    }
  }, [writeError]);

  const handleAction = async (type: string) => {
    setErrorMessage(null);
    setIsPendingTx(true);
    setTxHash(null);

    try {
      if (type === "rental") {
        const durationSeconds = BigInt(hireHours * 3600);
        // hourlyRate * durationSeconds / 3600 = hourlyRate * hireHours
        const totalPayment = parseEther((hireHours * parseFloat(rentalPrice)).toString());

        writeContract({
          address: MARKETPLACE_ADDRESS,
          abi: MARKETPLACE_ABI,
          functionName: "hireAgent",
          args: [BigInt(tokenId), durationSeconds],
          value: totalPayment,
        });
      } else if (type === "buyout") {
        if (!buyoutPrice) return;
        // Pass dummy bytes for proof in preview / test environments
        const sealedKeyDummy = "0x01020304" as `0x${string}`;
        const proofDummy = "0x01020304" as `0x${string}`;
        const totalPayment = parseEther(buyoutPrice);

        writeContract({
          address: MARKETPLACE_ADDRESS,
          abi: MARKETPLACE_ABI,
          functionName: "purchase",
          args: [BigInt(tokenId), sealedKeyDummy, proofDummy],
          value: totalPayment,
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to trigger transaction.");
      setIsPendingTx(false);
    }
  };

  const purchaseOptions = [
    {
      type: "buyout",
      title: "Full Buyout",
      price: buyoutPrice,
      icon: <Coins className="w-5 h-5 text-brand" />,
      description: "Own the Agentic ID. Grants unlimited personal chat usage and transfers creator royalties directly to you.",
      actionLabel: "Buy Agentic ID",
    },
    {
      type: "rental",
      title: "Hourly Hire",
      price: rentalPrice,
      icon: <Clock className="w-5 h-5 text-emerald-400" />,
      description: "Hire the AI agent for a specific duration. Requires a 40% platform fee and 60% creator payout split.",
      actionLabel: "Hire Agent",
    },
    {
      type: "ppm",
      title: "Pay-Per-Message",
      price: ppmPrice,
      icon: <CreditCard className="w-5 h-5 text-sky-400" />,
      description: "Pre-fund message credits. Deducts tokens from your balance only when chat requests complete.",
      actionLabel: "Pre-fund Credits",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Access Pricing</h2>
      
      <div className="grid grid-cols-1 gap-4">
        {purchaseOptions.map((opt) => {
          const isAvailable = opt.price !== undefined && opt.price !== "" && opt.price !== "0";
          const currentPrice = opt.type === "rental" ? (hireHours * parseFloat(rentalPrice)).toFixed(2) : opt.price;

          return (
            <Card
              key={opt.type}
              hoverable={isAvailable}
              className={`border border-white/5 flex flex-col justify-between p-5 relative overflow-hidden ${
                !isAvailable ? "opacity-40" : ""
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/5 rounded-lg border border-white/5">
                      {opt.icon}
                    </div>
                    <span className="font-semibold text-white text-sm">{opt.title}</span>
                  </div>
                  {isAvailable && (
                    <span className="font-bold text-brand">
                      {opt.type === "rental" ? rentalPrice : opt.price} <span className="text-xs text-white/50">0G{opt.type === "rental" && "/hour"}</span>
                    </span>
                  )}
                </div>
                
                {/* Description */}
                <p className="text-xs text-white/50 leading-relaxed">
                  {opt.description}
                </p>

                {/* Hourly Hire Calculator */}
                {opt.type === "rental" && isAvailable && (
                  <div className="mt-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/50">Select Duration:</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          max="720"
                          value={hireHours}
                          onChange={(e) => setHireHours(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 bg-white/5 border border-white/5 text-center text-white rounded py-1 px-1 focus:outline-none focus:border-brand/40 text-xs font-semibold"
                        />
                        <span className="text-white/40">hours</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-white/5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-white/40">Hourly rate:</span>
                        <span className="text-white font-medium">{rentalPrice} 0G/hour</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Selected duration:</span>
                        <span className="text-white font-medium">{hireHours} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Creator receives (60%):</span>
                        <span className="text-emerald-400 font-bold">{(hireHours * parseFloat(rentalPrice) * 0.6).toFixed(2)} 0G</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/40">Platform fee (40%):</span>
                        <span className="text-brand font-bold">{(hireHours * parseFloat(rentalPrice) * 0.4).toFixed(2)} 0G</span>
                      </div>
                      <div className="flex justify-between pt-1.5 border-t border-white/5 text-xs font-bold">
                        <span className="text-white">Total to pay:</span>
                        <span className="text-brand">{currentPrice} 0G</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-4">
                {isAvailable ? (
                  opt.type === "ppm" ? (
                    <span className="text-xs text-white/30 italic block text-center py-2 bg-white/[0.02] border border-dashed border-white/5 rounded-lg">
                      Pay-Per-Message credits are funded automatically on chat
                    </span>
                  ) : (
                    <Button
                      disabled={!isConnected || isPendingTx || isWaiting}
                      variant={opt.type === "buyout" ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => handleAction(opt.type)}
                      className="w-full font-semibold gap-1.5"
                    >
                      {(isPendingTx || isWaiting) && <Loader2 className="w-4 h-4 animate-spin" />}
                      {!isConnected
                        ? "Connect Wallet to Purchase"
                        : isWaiting
                        ? "Confirming Transaction..."
                        : isPendingTx
                        ? "Sign in Wallet..."
                        : `${opt.actionLabel} (${currentPrice} 0G)`}
                    </Button>
                  )
                ) : (
                  <span className="text-xs text-white/30 italic block text-center py-2 bg-white/[0.02] border border-dashed border-white/5 rounded-lg">
                    Pricing tier not configured by creator
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Transaction status explorer link */}
      {txHash && (
        <div className="p-3 bg-brand/5 border border-brand/20 rounded-lg text-center">
          <a
            href={`${EXPLORER_URL}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand hover:underline font-semibold"
          >
            Transaction Submitted! View on ChainScan
          </a>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs">
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      {/* Access indicator alert */}
      <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-amber-400">Access Restricted</h4>
          <p className="text-[11px] text-white/50 leading-relaxed">
            Decrypted prompt credentials require on-chain access validation. Access checks happen via smart contract logic on the server before serving inference request.
          </p>
        </div>
      </div>
    </div>
  );
};
