import React from "react";
import Link from "next/navigation";
import { ExternalLink } from "lucide-react";
import { OG_NETWORKS } from "../../lib/constants";

export const Footer = () => {
  const currentNetwork = OG_NETWORKS.testnet; // Galileo testnet default

  return (
    <footer className="border-t border-white/5 bg-bg-dark/50 py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-brand/10 rounded-md">
                <img
                  src="/logo.png"
                  alt="Bat Agents Logo"
                  className="w-6 h-6 object-contain"
                />
              </span>
              <span className="text-lg font-bold tracking-tight text-white">
                Bat <span className="text-brand">Agents</span>
              </span>
            </div>
            <p className="text-sm text-white/50 max-w-sm">
              A fully 0G-native AI agent marketplace. Mint intelligence as Agentic IDs, list them, and earn on-chain every time someone chats.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Resources
            </h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <a
                  href="https://docs.0g.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand transition-colors inline-flex items-center gap-1"
                >
                  0G Documentation <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://faucet.0g.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand transition-colors inline-flex items-center gap-1"
                >
                  0G Faucet <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://pc.testnet.0g.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand transition-colors inline-flex items-center gap-1"
                >
                  0G Compute Console <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Verification / Explorers */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              0G Proof
            </h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <a
                  href={currentNetwork.chainScan}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand transition-colors inline-flex items-center gap-1 text-xs"
                >
                  ChainScan Galileo <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href={currentNetwork.storageScan}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand transition-colors inline-flex items-center gap-1 text-xs"
                >
                  StorageScan Galileo <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li className="text-xs text-white/40 mt-4">
                Network: Galileo Testnet (16602)
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40">
          <p>© {new Date().getFullYear()} Bat Agents. Built for the 0G ecosystem.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <span className="hover:text-white transition-colors">MIT License</span>
            <span>•</span>
            <span className="hover:text-white transition-colors">Fully Decentralized</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
