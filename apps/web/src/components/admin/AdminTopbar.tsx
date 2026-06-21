"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import { ADMIN_REGISTRY_ADDRESS, ADMIN_REGISTRY_ABI } from "@/lib/admin/adminRegistry";
import { isLocalAdminAllowed } from "@/lib/admin/adminAccess";
import { ConnectButton } from "@/components/wallet/ConnectButton";

export const AdminTopbar: React.FC = () => {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();

  const hasValidRegistryAddress = ADMIN_REGISTRY_ADDRESS && ADMIN_REGISTRY_ADDRESS !== "0x0000000000000000000000000000000000000000";

  const { data: isRegistryAdmin } = useReadContract({
    address: hasValidRegistryAddress ? ADMIN_REGISTRY_ADDRESS : undefined,
    abi: ADMIN_REGISTRY_ABI,
    functionName: "canAccessAdmin",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && hasValidRegistryAddress,
    }
  });

  const isLocalAdmin = isLocalAdminAllowed(address);
  const authSource = isRegistryAdmin
    ? "On-Chain Registry"
    : isLocalAdmin
    ? "Allowlist Env"
    : "Unverified";

  // Determine page title based on path
  const getPageTitle = () => {
    if (pathname === "/admin") return "Security & Operations Overview";
    if (pathname?.startsWith("/admin/users")) return "User Security & Risk Management";
    if (pathname === "/admin/agents") return "AI Agent Guardrails & Audits";
    if (pathname === "/admin/transactions") return "On-Chain Activity Monitoring";
    if (pathname === "/admin/reports") return "Abuse & Output Reporting Center";
    if (pathname === "/admin/security") return "Real-time Cyber Security Signals";
    return "Operations Panel";
  };

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-md px-6 flex items-center justify-between z-10 shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-white">{getPageTitle()}</h1>
        <p className="text-xs text-zinc-500 hidden sm:block">Bat Agents Galileo Testnet Monitoring</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Network Badge */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          Galileo Testnet
        </div>

        {/* Auth Badge */}
        {isConnected && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-brand/10 text-brand border border-brand/20 text-xs font-mono">
            <span>Auth:</span>
            <span className="font-semibold">{authSource}</span>
          </div>
        )}

        <ConnectButton />
      </div>
    </header>
  );
};
