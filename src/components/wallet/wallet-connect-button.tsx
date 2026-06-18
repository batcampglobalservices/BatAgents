"use client";

import { useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
} from "@starknet-react/core";
import { Wallet } from "lucide-react";
import { STARKNET_CHAIN } from "@/lib/starknet-config";
import { shortenAddress } from "@/lib/starknet-payments";

export default function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { connectors, connectAsync, pendingConnector, error } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const [localError, setLocalError] = useState<string | null>(null);

  const availableConnectors = connectors.filter((connector) => connector.available());
  const isSepolia = chain.network === STARKNET_CHAIN.network;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">
            Live wallet
          </p>
          <p className="mt-1 text-sm text-slate-300">
            {isConnected
              ? "Connected to Starknet Sepolia testnet"
              : "Connect a live Starknet wallet"}
          </p>
        </div>

        {isConnected ? (
          <button
            type="button"
            onClick={async () => {
              setLocalError(null);
              await disconnectAsync();
            }}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-cyan-400/30 hover:bg-white/10"
          >
            Disconnect
          </button>
        ) : null}
      </div>

      {isConnected ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Badge label="Address" value={address ? shortenAddress(address) : "Unknown"} />
          <Badge
            label="Network"
            value={isSepolia ? "Starknet Sepolia" : chain.name}
            tone={isSepolia ? "ok" : "warn"}
          />
        </div>
      ) : null}

      {isConnected && !isSepolia ? (
        <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
          Switch this wallet to Starknet Sepolia before hiring or registering agents.
        </div>
      ) : null}

      {!isConnected ? (
        <div className="mt-4 grid gap-2">
          {availableConnectors.length > 0 ? (
            availableConnectors.map((connector) => {
              const pending = pendingConnector?.id === connector.id;

              return (
                <button
                  key={connector.id}
                  type="button"
                  onClick={async () => {
                    setLocalError(null);
                    try {
                      await connectAsync({ connector });
                    } catch (connectError) {
                      setLocalError(
                        connectError instanceof Error
                          ? connectError.message
                          : "Wallet connection failed.",
                      );
                    }
                  }}
                  className="inline-flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-cyan-400/40 hover:bg-white/10"
                >
                  <span className="inline-flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Connect {connector.name}
                  </span>
                  <span className="text-xs text-slate-400">
                    {pending ? "Connecting..." : "Live wallet"}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              Install Argent X or Braavos, then refresh to connect to Starknet Sepolia.
            </div>
          )}
        </div>
      ) : null}

      {(error || localError) && !isConnected ? (
        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
          {localError || error?.message || "Wallet connection failed."}
        </div>
      ) : null}
    </div>
  );
}

function Badge({
  label,
  value,
  tone = "normal",
}: {
  label: string;
  value: string;
  tone?: "normal" | "ok" | "warn";
}) {
  const styles =
    tone === "ok"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
      : tone === "warn"
        ? "border-amber-400/20 bg-amber-400/10 text-amber-100"
        : "border-white/10 bg-white/5 text-slate-200";

  return (
    <div className={`rounded-2xl border px-4 py-3 ${styles}`}>
      <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
