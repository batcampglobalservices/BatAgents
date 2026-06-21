"use client";

import React from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { useAccount } from "wagmi";
import { ShieldAlert, CreditCard, Clock, Coins } from "lucide-react";

interface PricingPanelProps {
  buyoutPrice?: string;
  rentalPrice?: string;
  ppmPrice?: string;
}

export const PricingPanel: React.FC<PricingPanelProps> = ({
  buyoutPrice,
  rentalPrice,
  ppmPrice,
}) => {
  const { isConnected } = useAccount();

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
      title: "Daily Rental",
      price: rentalPrice,
      icon: <Clock className="w-5 h-5 text-emerald-400" />,
      description: "Temporary authorization. Access the agent prompt decryption key for exactly 24 hours.",
      actionLabel: "Rent Agent",
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
          const isAvailable = opt.price !== undefined && opt.price !== "";
          
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
                      {opt.price} <span className="text-xs text-white/50">0G</span>
                    </span>
                  )}
                </div>
                
                {/* Description */}
                <p className="text-xs text-white/50 leading-relaxed">
                  {opt.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-4">
                {isAvailable ? (
                  <Button
                    disabled={!isConnected}
                    variant={opt.type === "buyout" ? "primary" : "secondary"}
                    size="sm"
                    className="w-full font-semibold"
                  >
                    {!isConnected
                      ? "Connect Wallet to Purchase"
                      : `${opt.actionLabel} (${opt.price} 0G)`}
                  </Button>
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
