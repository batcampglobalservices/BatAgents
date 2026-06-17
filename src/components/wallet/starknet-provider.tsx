"use client";

import type { ReactNode } from "react";
import { QueryClient } from "@tanstack/react-query";
import {
  StarknetConfig,
  argent,
  braavos,
  publicProvider,
} from "@starknet-react/core";
import { STARKNET_CHAIN } from "@/lib/starknet-config";

const queryClient = new QueryClient();
const connectors = [argent(), braavos()];

type StarknetProviderProps = {
  children: ReactNode;
};

export default function StarknetProvider({ children }: StarknetProviderProps) {
  return (
    <StarknetConfig
      chains={[STARKNET_CHAIN]}
      provider={publicProvider()}
      connectors={connectors}
      autoConnect={false}
      queryClient={queryClient}
      defaultChainId={STARKNET_CHAIN.id}
    >
      {children}
    </StarknetConfig>
  );
}
