"use client";

import React from "react";
import { useAccount, useReadContract } from "wagmi";
import { ADMIN_REGISTRY_ABI, ADMIN_REGISTRY_ADDRESS } from "@/lib/admin/adminRegistry";
import { isLocalAdminAllowed } from "@/lib/admin/adminAccess";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <h1 className="text-3xl font-bold mb-4 text-white">Admin / Ops Portal</h1>
        <p className="text-zinc-400 mb-8 max-w-md">
          This portal is restricted to authorized platform operators and administrators. Connect your wallet to verify access.
        </p>
        <ConnectButton />
      </div>
    );
  }

  if (isCheckingContract) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-400 mt-4 font-medium">Verifying authorization status...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-6 border border-red-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2 text-white">Access Denied</h1>
        <p className="text-zinc-400 max-w-md mb-8">
          Your wallet (<span className="font-mono text-zinc-300">{address?.slice(0, 6)}...{address?.slice(-4)}</span>) is not authorized to access this section. If you believe this is an error, contact the platform deployer.
        </p>
        <div className="flex gap-4">
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col md:flex-row">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-zinc-950">
          {children}
        </main>
      </div>
    </div>
  );
}
