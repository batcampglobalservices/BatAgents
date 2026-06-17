"use client";

import type { ReactNode } from "react";
import { QueryClient } from "@tanstack/react-query";
import {
  StarknetConfig,
  argent,
  braavos,
  jsonRpcProvider,
} from "@starknet-react/core";
import { STARKNET_CHAIN } from "@/lib/starknet-config";

const queryClient = new QueryClient();
const connectors = [argent(), braavos()];
const STARKNET_RPC_URL =
  process.env.NEXT_PUBLIC_STARKNET_RPC_URL?.trim() || "/api/starknet/rpc";

type StarknetProviderProps = {
  children: ReactNode;
};

export default function StarknetProvider({ children }: StarknetProviderProps) {
  return (
    <StarknetConfig
      chains={[STARKNET_CHAIN]}
      provider={jsonRpcProvider({
        rpc: (chain) => {
          if (chain.network !== STARKNET_CHAIN.network) {
            return null;
          }

          return {
            nodeUrl: STARKNET_RPC_URL,
          };
        },
      })}
      connectors={connectors}
      autoConnect={false}
      queryClient={queryClient}
      defaultChainId={STARKNET_CHAIN.id}
    >
      {children}
    </StarknetConfig>
  );
}
