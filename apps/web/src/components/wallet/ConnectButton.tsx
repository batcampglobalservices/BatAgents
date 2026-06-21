"use client";

import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "../ui/Button";

export const ConnectButton = () => {
  return (
    <RainbowConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    variant="primary"
                    size="sm"
                    className="font-semibold"
                  >
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    variant="danger"
                    size="sm"
                    className="font-semibold"
                  >
                    Wrong Network
                  </Button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openChainModal}
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-brand/40 bg-white/5 hover:bg-brand/10 transition-all text-xs font-semibold text-white/80"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 14,
                          height: 14,
                          borderRadius: 999,
                          overflow: "hidden",
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            style={{ width: 14, height: 14 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-brand/20 bg-brand/10 hover:bg-brand/20 text-brand text-xs font-semibold shadow-[0_0_15px_rgba(234,96,2,0.1)] hover:shadow-[0_0_20px_rgba(234,96,2,0.2)] transition-all"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ""}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
};
