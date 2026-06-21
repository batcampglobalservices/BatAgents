"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { useAccount } from "wagmi";
import { MODEL_OPTIONS } from "../../lib/constants";
import { ShieldCheck, HardDrive, Cpu, Coins, Plus, Settings } from "lucide-react";

export const CreateAgentForm = () => {
  const { isConnected } = useAccount();

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [model, setModel] = useState(MODEL_OPTIONS[0].id);

  // Pricing State
  const [enableBuyout, setEnableBuyout] = useState(true);
  const [buyoutPrice, setBuyoutPrice] = useState("10");
  
  const [enableRental, setEnableRental] = useState(false);
  const [rentalPrice, setRentalPrice] = useState("1");
  
  const [enablePpm, setEnablePpm] = useState(false);
  const [ppmPrice, setPpmPrice] = useState("0.1");

  const [step, setStep] = useState(1);
  const [isValidated, setIsValidated] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !systemPrompt) return;
    setStep(2); // Move to review step
  };

  const handleCreate = () => {
    // Prohibit fake blockchain transactions. Form stops here with instructions.
    setIsValidated(true);
  };

  if (!isConnected) {
    return (
      <Card hoverable={false} className="max-w-xl mx-auto border border-white/5 p-8 text-center space-y-6">
        <div className="mx-auto w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
          <Settings className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white">Wallet Connection Required</h3>
          <p className="text-sm text-white/50 leading-relaxed">
            Creating an AI agent requires deploying parameters on-chain. Connect your Web3 wallet using the header button to initialize the creator panel.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
        <span className={step === 1 ? "text-brand" : "text-white/80"}>01. Configuration</span>
        <span>•</span>
        <span className={step === 2 ? "text-brand" : ""}>02. Review & Mint</span>
      </div>

      {step === 1 ? (
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <Card hoverable={false} className="border border-white/5 space-y-6">
            <h2 className="text-xl font-bold text-white">Agent Persona Details</h2>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/70 uppercase">Agent Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Solidity Guru"
                className="w-full bg-white/5 border border-white/5 focus:border-brand/40 focus:outline-none rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 transition-colors"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/70 uppercase">Marketplace Description</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what your agent does and how users can utilize its intelligence..."
                className="w-full bg-white/5 border border-white/5 focus:border-brand/40 focus:outline-none rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 transition-colors"
              />
            </div>

            {/* System Prompt */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-semibold text-white/70 uppercase">System Prompt (Persona Instructions)</label>
                <span className="text-[10px] text-amber-500 font-semibold uppercase">Encrypted</span>
              </div>
              <textarea
                required
                rows={5}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="You are a senior Solidity auditor. Check this contract for vulnerability vectors..."
                className="w-full bg-white/5 border border-white/5 focus:border-brand/40 focus:outline-none rounded-lg px-4 py-2.5 font-mono text-xs text-white placeholder-white/30 transition-colors"
              />
              <span className="text-[10px] text-white/40 block">
                Your prompt configuration is encrypted using AES-256 before uploading to 0G Storage. Only authorized buyers can decrypt.
              </span>
            </div>

            {/* Avatar & Model */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70 uppercase">Avatar Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                  className="w-full text-xs text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/5 file:text-white hover:file:bg-white/10 file:cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70 uppercase">Inference Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-[#12121A] border border-white/5 focus:border-brand/40 focus:outline-none rounded-lg px-3 py-2.5 text-sm text-white"
                >
                  {MODEL_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Pricing Config Card */}
          <Card hoverable={false} className="border border-white/5 space-y-6">
            <h2 className="text-xl font-bold text-white">Marketplace Pricing</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Buyout */}
              <div className="space-y-4 p-4 border border-white/5 rounded-xl bg-white/[0.01]">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableBuyout}
                    onChange={(e) => setEnableBuyout(e.target.checked)}
                    className="accent-brand"
                  />
                  <span className="text-sm font-semibold text-white">Enable Buyout</span>
                </div>
                {enableBuyout && (
                  <input
                    type="number"
                    value={buyoutPrice}
                    onChange={(e) => setBuyoutPrice(e.target.value)}
                    placeholder="Price in 0G"
                    className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-sm text-white"
                  />
                )}
              </div>

              {/* Rental */}
              <div className="space-y-4 p-4 border border-white/5 rounded-xl bg-white/[0.01]">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableRental}
                    onChange={(e) => setEnableRental(e.target.checked)}
                    className="accent-brand"
                  />
                  <span className="text-sm font-semibold text-white">Enable Rental</span>
                </div>
                {enableRental && (
                  <input
                    type="number"
                    value={rentalPrice}
                    onChange={(e) => setRentalPrice(e.target.value)}
                    placeholder="Price/day in 0G"
                    className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-sm text-white"
                  />
                )}
              </div>

              {/* PPM */}
              <div className="space-y-4 p-4 border border-white/5 rounded-xl bg-white/[0.01]">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enablePpm}
                    onChange={(e) => setEnablePpm(e.target.checked)}
                    className="accent-brand"
                  />
                  <span className="text-sm font-semibold text-white">Enable PPM</span>
                </div>
                {enablePpm && (
                  <input
                    type="number"
                    value={ppmPrice}
                    onChange={(e) => setPpmPrice(e.target.value)}
                    placeholder="Price/msg in 0G"
                    className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-sm text-white"
                  />
                )}
              </div>
            </div>
          </Card>

          {/* Subscription Fee Details Info Box */}
          <div className="p-4 bg-brand/5 border border-brand/20 rounded-xl space-y-2">
            <h4 className="text-xs font-semibold text-brand uppercase tracking-wider">Monetization & Listing Rules</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-white/40 block">Monthly platform fee:</span>
                <span className="font-bold text-white">0.05 0G</span>
                <span className="text-[10px] text-white/30 block">(First payment due now during creation/listing)</span>
              </div>
              <div className="space-y-1">
                <span className="text-white/40 block">Subscription duration:</span>
                <span className="font-bold text-white">30 days</span>
                <span className="text-[10px] text-white/30 block">(Renew monthly to keep agent hireable)</span>
              </div>
              <div className="space-y-1">
                <span className="text-white/40 block">Platform commission on hires:</span>
                <span className="font-bold text-brand">40%</span>
              </div>
              <div className="space-y-1">
                <span className="text-white/40 block">Creator payout from hires:</span>
                <span className="font-bold text-emerald-400">60%</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="lg" className="font-semibold">
              Continue to Review
            </Button>
          </div>
        </form>
      ) : (
        <Card hoverable={false} className="border border-white/5 space-y-6 relative z-10">
          <h2 className="text-xl font-bold text-white">Review Smart Contract Configuration</h2>
          
          <div className="space-y-4 text-sm border-y border-white/5 py-4">
            <div className="flex justify-between">
              <span className="text-white/50">Agent Name:</span>
              <span className="font-semibold text-white">{name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Model:</span>
              <span className="font-mono text-white/80">{model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Prompt Configuration:</span>
              <span className="text-amber-500 font-semibold">AES-256 Encrypted</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Pricing Configuration:</span>
              <div className="text-right space-y-1 font-semibold text-white">
                {enableBuyout && <div>Buyout: {buyoutPrice} 0G</div>}
                {enableRental && <div>Rental: {rentalPrice} 0G/day</div>}
                {enablePpm && <div>PPM: {ppmPrice} 0G/msg</div>}
              </div>
            </div>
          </div>

          {/* Action indicator panels */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-white/70 uppercase">Decentralized Execution Flow</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 border border-white/5 rounded-lg bg-white/[0.01] space-y-1">
                <span className="font-semibold text-brand flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5" />
                  0G Storage
                </span>
                <p className="text-white/40 leading-relaxed">
                  Upload configuration assets. Prompts are sealed using owner keys.
                </p>
              </div>

              <div className="p-3 border border-white/5 rounded-lg bg-white/[0.01] space-y-1">
                <span className="font-semibold text-brand flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" />
                  0G Chain
                </span>
                <p className="text-white/40 leading-relaxed">
                  Mint Agentic ID NFT. Register on-chain metadata reference.
                </p>
              </div>

              <div className="p-3 border border-white/5 rounded-lg bg-white/[0.01] space-y-1">
                <span className="font-semibold text-brand flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  Marketplace
                </span>
                <p className="text-white/40 leading-relaxed">
                  Approve marketplace registry. List access terms for buyers.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="secondary" onClick={() => setStep(1)} className="font-semibold">
              Back to Edit
            </Button>

            {!isValidated ? (
              <Button onClick={handleCreate} className="font-semibold">
                Mint Agentic ID
              </Button>
            ) : (
              <div className="p-4 bg-brand/5 border border-dashed border-brand/20 rounded-xl max-w-md text-center space-y-2">
                <span className="text-xs font-bold text-brand uppercase tracking-wider block">
                  Minting Pipeline Verification
                </span>
                <p className="text-xs text-white/50 leading-relaxed">
                  Mock transactions are disabled. Once Phase 1 contracts are deployed, this button will request a wallet signature to upload properties and initiate the `mint` transaction.
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
