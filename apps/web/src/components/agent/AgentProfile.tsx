import React from "react";
import { Badge } from "../ui/Badge";
import { ShieldCheck, HardDrive, Cpu, ExternalLink } from "lucide-react";
import { OG_NETWORKS } from "../../lib/constants";

interface AgentProfileProps {
  id: string;
  name: string;
  description: string;
  creator: string;
  metadataHash?: string; // 0G Storage reference
  modelName: string;
}

export const AgentProfile: React.FC<AgentProfileProps> = ({
  id,
  name,
  description,
  creator,
  metadataHash = "",
  modelName,
}) => {
  const shortCreator = `${creator.substring(0, 6)}...${creator.substring(creator.length - 4)}`;
  const shortHash = metadataHash ? `${metadataHash.substring(0, 8)}...${metadataHash.substring(metadataHash.length - 8)}` : "";
  const currentNetwork = OG_NETWORKS.testnet;

  return (
    <div className="space-y-6">
      {/* Name and avatar header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-black text-2xl">
          {name.substring(0, 2).toUpperCase()}
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-white/50">Creator:</span>
            <span className="text-xs font-mono text-white/80 bg-white/5 px-2 py-0.5 rounded border border-white/5">
              {shortCreator}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-white/80">About Agent</h3>
        <p className="text-sm text-white/60 leading-relaxed">{description}</p>
      </div>

      {/* 0G Architecture Verification Metadata Panel */}
      <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-brand tracking-wider uppercase">
          <ShieldCheck className="w-4 h-4" />
          <span>0G Infrastructure Verification</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Metadata Storage Reference */}
          <div className="space-y-1">
            <span className="text-white/40 block">0G Storage Root Hash</span>
            {metadataHash ? (
              <a
                href={`${currentNetwork.storageScan}/tx/${metadataHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-white/80 hover:text-brand flex items-center gap-1 transition-colors"
              >
                {shortHash} <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-white/30 italic">Not listed yet</span>
            )}
          </div>

          {/* Model compute path */}
          <div className="space-y-1">
            <span className="text-white/40 block">0G Compute Model</span>
            <span className="font-mono text-white/80 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-brand/80" />
              {modelName}
            </span>
          </div>

          {/* Agentic ID token ID */}
          <div className="space-y-1">
            <span className="text-white/40 block">ERC-7857 Token ID</span>
            <span className="font-mono text-white/80">
              {id !== "preview" ? id : <span className="text-white/30 italic">Unminted</span>}
            </span>
          </div>

          {/* Verification scan link */}
          <div className="space-y-1">
            <span className="text-white/40 block">On-Chain Scan</span>
            <span className="text-white/30 italic">
              Verification links will populate after active deployment
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
