"use client";

import React from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { useAccount } from "wagmi";
import { Coins, ExternalLink, ShieldAlert } from "lucide-react";

interface EarningsPanelProps {
  claimableAmount?: string;
  withdrawnAmount?: string;
}

export const EarningsPanel: React.FC<EarningsPanelProps> = ({
  claimableAmount = "0.00",
  withdrawnAmount = "0.00",
}) => {
  const { isConnected } = useAccount();

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-white/70 uppercase">Royalties & Splits</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Claimable Balance Card */}
        <Card hoverable={false} className="border border-white/5 p-5 flex flex-col justify-between h-48 bg-brand/5 relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <span className="text-xs text-white/50 block font-semibold uppercase">Claimable Earnings</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{claimableAmount}</span>
              <span className="text-sm font-bold text-brand uppercase">0G</span>
            </div>
            <p className="text-xs text-white/40 leading-normal max-w-xs">
              Accrued royalty payouts from marketplace buyouts, rent terms, and PPM credits.
            </p>
          </div>

          <div className="pt-4 relative z-10">
            <Button
              disabled={!isConnected || parseFloat(claimableAmount) === 0}
              variant="primary"
              size="sm"
              className="w-full font-semibold"
            >
              {!isConnected
                ? "Connect Wallet to Claim"
                : `Withdraw Royalties (${claimableAmount} 0G)`}
            </Button>
          </div>
        </Card>

        {/* History / Splits Overview Card */}
        <Card hoverable={false} className="border border-white/5 p-5 flex flex-col justify-between h-48">
          <div className="space-y-3">
            <span className="text-xs text-white/50 block font-semibold uppercase">Royalties Split Math</span>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/40">Creator Split:</span>
                <span className="font-semibold text-white">60%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Platform Fee:</span>
                <span className="font-semibold text-white">40%</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/5">
                <span className="text-white/40">Total Lifetime Earnings:</span>
                <span className="font-semibold text-white">{withdrawnAmount} 0G</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-center gap-2 text-[10px] text-white/40">
            <ShieldAlert className="w-4 h-4 text-brand shrink-0" />
            <span>Withdrawals are executed directly against the on-chain Royalties ledger.</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
