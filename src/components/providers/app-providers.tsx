"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import StarknetProvider from "@/components/wallet/starknet-provider";
import LocalAgentSync from "@/components/agents/local-agent-sync";

type AppProvidersProps = {
  children: ReactNode;
};

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <StarknetProvider>
      <LocalAgentSync />
      {children}
      <Toaster richColors position="top-right" theme="dark" />
    </StarknetProvider>
  );
}
