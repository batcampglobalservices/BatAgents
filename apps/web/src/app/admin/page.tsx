"use client";

import React from "react";
import { useAccount, useReadContract } from "wagmi";
import { ADMIN_REGISTRY_ABI, ADMIN_REGISTRY_ADDRESS } from "@/lib/admin/adminRegistry";
import { isLocalAdminAllowed } from "@/lib/admin/adminAccess";

export default function AdminPage() {
  const { address, isConnected } = useAccount();

  const hasValidRegistryAddress = ADMIN_REGISTRY_ADDRESS && ADMIN_REGISTRY_ADDRESS !== "0x0000000000000000000000000000000000000000";

  const { data: isRegistryAdmin, isLoading: isCheckingContract } = useReadContract({
    address: hasValidRegistryAddress ? ADMIN_REGISTRY_ADDRESS : undefined,
    abi: ADMIN_REGISTRY_ABI,
    functionName: "canAccessAdmin",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && hasValidRegistryAddress,
    }
  });

  const isLocalAdmin = isLocalAdminAllowed(address);
  const isAuthorized = !!isRegistryAdmin || isLocalAdmin;

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-text-secondary mb-8">Connect your wallet to continue.</p>
        <appkit-button />
      </div>
    );
  }

  if (isCheckingContract) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-text-secondary mt-4">Verifying admin access...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-text-secondary max-w-md">
          Your connected wallet does not have superadmin or moderator privileges.
        </p>
        <div className="mt-8">
          <appkit-button />
        </div>
      </div>
    );
  }

  const accessSource = isRegistryAdmin ? "AdminRegistry (On-Chain)" : "Local Dev Allowlist";

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 pb-6 border-b border-border-color">
        <h1 className="text-3xl font-bold text-white mb-2">Bat Agents Superadmin</h1>
        <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>Status: Authorized</span>
          </div>
          <div>|</div>
          <div>Access source: {accessSource}</div>
          <div>|</div>
          <div>Wallet: <span className="font-mono">{address?.slice(0,6)}...{address?.slice(-4)}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard title="Platform Users" />
        <DashboardCard title="Agents" />
        <DashboardCard title="Reports" />
        <DashboardCard title="Transactions" />
        <DashboardCard title="Security Monitoring" />
      </div>
    </div>
  );
}

function DashboardCard({ title }: { title: string }) {
  return (
    <div className="bg-bg-light border border-border-color rounded-xl p-6 flex flex-col items-center justify-center text-center h-40 opacity-70 hover:opacity-100 transition-opacity cursor-not-allowed">
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <span className="text-xs uppercase tracking-wider text-primary font-semibold px-2 py-1 rounded bg-primary/10">Coming Soon</span>
    </div>
  );
}
