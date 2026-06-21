import React from "react";
import Link from "next/link";
import { Button } from "../ui/Button";
import { GlowEffect } from "../ui/GlowEffect";
import { ArrowRight, Cpu, HardDrive, Shield } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden py-24 md:py-32 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
      {/* Visual background elements */}
      <GlowEffect position="center" size="xl" opacity="opacity-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#0A0A0F)] z-0" />
      
      {/* Content wrapper */}
      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        {/* Banner badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand/20 bg-brand/5 text-xs text-brand font-semibold shadow-[0_0_15px_rgba(234,96,2,0.1)]">
          <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          Live on 0G Galileo Testnet
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Mint Your AI Agent.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-[#ff843a]">
            Sell Its Intelligence.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
          The first fully 0G-native marketplace. Tokenize your prompt, system persona, and knowledge files as encrypted Agentic IDs. Get paid directly on-chain every time someone chats with your agent.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/create">
            <Button size="lg" className="w-full sm:w-auto font-semibold flex items-center gap-2">
              Create Agent <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/marketplace">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto font-semibold">
              Browse Marketplace
            </Button>
          </Link>
        </div>

        {/* Features minimal grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 max-w-3xl mx-auto border-t border-white/5">
          <div className="flex flex-col items-center p-4">
            <Shield className="w-8 h-8 text-brand/80 mb-2" />
            <h3 className="text-sm font-semibold text-white">ERC-7857 Agentic IDs</h3>
            <p className="text-xs text-white/40 text-center mt-1">Encrypted, transferable agent metadata owned by you</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <HardDrive className="w-8 h-8 text-brand/80 mb-2" />
            <h3 className="text-sm font-semibold text-white">0G Storage</h3>
            <p className="text-xs text-white/40 text-center mt-1">Avatars and encrypted knowledge files stored decentralized</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <Cpu className="w-8 h-8 text-brand/80 mb-2" />
            <h3 className="text-sm font-semibold text-white">0G Compute</h3>
            <p className="text-xs text-white/40 text-center mt-1">TEE-verified decentralized GPU inference for every response</p>
          </div>
        </div>
      </div>
    </div>
  );
};
