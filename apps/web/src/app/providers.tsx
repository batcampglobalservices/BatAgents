"use client";

import React from "react";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider, http } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ogGalileoTestnet } from "../config/chains";

// Custom config for Galileo
const config = getDefaultConfig({
  appName: "Bat Agents",
  projectId: "8f58d0426b38c20bc66c5a0836e65a0b", // Public dummy projectId for developer demo
  chains: [ogGalileoTestnet],
  transports: {
    [ogGalileoTestnet.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#EA6002",
            borderRadius: "medium",
            overlayBlur: "small",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
