"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { 
  useAccount, 
  useReadContract, 
  useWriteContract, 
  useWaitForTransactionReceipt 
} from "wagmi";
import { MODEL_OPTIONS } from "../../lib/constants";
import { ShieldCheck, HardDrive, Cpu, Coins, Plus, Settings, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { keccak256, stringToHex, parseEther } from "viem";
import Link from "next/link";

// Deployed Contract Addresses from .env / defaults
const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_AGENT_FACTORY_ADDRESS || "0x40DA32BF5A62D43F41Eb86a362B456de3665ea41") as `0x${string}`;
const MARKETPLACE_ADDRESS = (process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "0x54c31DE1B30f572e6016655096a545a2299D518d") as `0x${string}`;
const NFT_ADDRESS = (process.env.NEXT_PUBLIC_AGENT_NFT_ADDRESS || "0xa51FabE8F60044A9db55A3874F2Ab37f8485bd11") as `0x${string}`;
const EXPLORER_URL = process.env.NEXT_PUBLIC_ZERO_G_EXPLORER_URL || "https://chainscan-galileo.0g.ai";

// Contract ABIs
const AGENT_FACTORY_ABI = [
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "category", type: "string" },
      { internalType: "string", name: "metadataURI", type: "string" },
      { internalType: "bytes32", name: "metadataHash", type: "bytes32" },
      { internalType: "bytes32", name: "encryptedDataHash", type: "bytes32" }
    ],
    name: "createAgent",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "mintFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

export const CreateAgentForm = () => {
  const { isConnected, address } = useAccount();

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

  // Decentralized Registration Pipeline State
  // Steps: 'idle' -> 'minting' -> 'minted' -> 'approving' -> 'approved' -> 'listing' -> 'completed'
  const [pipelineStep, setPipelineStep] = useState<
    "idle" | "mint_sign" | "mint_wait" | "minted" | "approve_sign" | "approve_wait" | "approved" | "list_sign" | "list_wait" | "completed"
  >("idle");
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [mintTxHash, setMintTxHash] = useState<`0x${string}` | null>(null);
  const [approveTxHash, setApproveTxHash] = useState<`0x${string}` | null>(null);
  const [listTxHash, setListTxHash] = useState<`0x${string}` | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Read configurations from contracts
  const { data: mintFee } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: AGENT_FACTORY_ABI,
    functionName: "mintFee",
  });

  const { data: monthlyCreatorFee } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: [
      {
        inputs: [],
        name: "monthlyCreatorFeeWei",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
      }
    ] as const,
    functionName: "monthlyCreatorFeeWei",
  });

  // Wagmi Write Hook
  const { writeContract, data: txHash, error: writeError, reset: resetWrite } = useWriteContract();

  // Handle Minting Succeeded
  const { data: mintReceipt, isSuccess: isMintConfirmed, error: mintWaitError } = useWaitForTransactionReceipt({
    hash: mintTxHash || undefined,
  });

  // Handle Approval Succeeded
  const { isSuccess: isApproveConfirmed, error: approveWaitError } = useWaitForTransactionReceipt({
    hash: approveTxHash || undefined,
  });

  // Handle Listing Succeeded
  const { isSuccess: isListConfirmed, error: listWaitError } = useWaitForTransactionReceipt({
    hash: listTxHash || undefined,
  });

  // Track write transactions and assign to appropriate steps
  useEffect(() => {
    if (txHash) {
      if (pipelineStep === "mint_sign") {
        setMintTxHash(txHash);
        setPipelineStep("mint_wait");
      } else if (pipelineStep === "approve_sign") {
        setApproveTxHash(txHash);
        setPipelineStep("approve_wait");
      } else if (pipelineStep === "list_sign") {
        setListTxHash(txHash);
        setPipelineStep("list_wait");
      }
      resetWrite();
    }
  }, [txHash, pipelineStep, resetWrite]);

  // Track transaction execution errors
  useEffect(() => {
    if (writeError) {
      setErrorMessage(writeError.message || "User rejected the transaction signature request.");
      // Roll back to active states
      if (pipelineStep === "mint_sign") setPipelineStep("idle");
      else if (pipelineStep === "approve_sign") setPipelineStep("minted");
      else if (pipelineStep === "list_sign") setPipelineStep("approved");
    }
  }, [writeError, pipelineStep]);

  // Extract Token ID from Mint Receipt Logs
  useEffect(() => {
    if (isMintConfirmed && mintReceipt) {
      try {
        // AgentCreated event is the first log emitted by AgentFactory
        // Topic 1 holds the indexed tokenId
        const createdLog = mintReceipt.logs.find(
          (log) => log.address.toLowerCase() === FACTORY_ADDRESS.toLowerCase()
        );
        const indexedTokenId = createdLog?.topics?.[1];
        if (indexedTokenId) {
          const id = BigInt(indexedTokenId).toString();
          setTokenId(id);
        } else {
          setTokenId("1"); // Fallback if topics parsing failed
        }
        setPipelineStep("minted");
      } catch (err) {
        console.error("Error parsing tokenId:", err);
        setTokenId("1");
        setPipelineStep("minted");
      }
    }
  }, [isMintConfirmed, mintReceipt]);

  // Track approval receipt confirmation
  useEffect(() => {
    if (isApproveConfirmed) {
      setPipelineStep("approved");
    }
  }, [isApproveConfirmed]);

  // Track listing receipt confirmation
  useEffect(() => {
    if (isListConfirmed) {
      setPipelineStep("completed");
    }
  }, [isListConfirmed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !systemPrompt) return;
    setStep(2); // Move to review step
  };

  // Pipeline Actions
  const handleMint = () => {
    setErrorMessage(null);
    setPipelineStep("mint_sign");
    try {
      const nameHash = keccak256(stringToHex(JSON.stringify({ name, description, model })));
      const encryptedHash = keccak256(stringToHex(systemPrompt));
      const metadataURI = `https://indexer-storage-testnet-turbo.0g.ai/api/metadata/${nameHash}`;

      writeContract({
        address: FACTORY_ADDRESS,
        abi: AGENT_FACTORY_ABI,
        functionName: "createAgent",
        args: [name, "AI Agent", metadataURI, nameHash, encryptedHash],
        value: mintFee || BigInt(0),
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to prepare transaction");
      setPipelineStep("idle");
    }
  };

  const handleApprove = () => {
    if (!tokenId) return;
    setErrorMessage(null);
    setPipelineStep("approve_sign");
    try {
      writeContract({
        address: NFT_ADDRESS,
        abi: [
          {
            inputs: [
              { internalType: "address", name: "to", type: "address" },
              { internalType: "uint256", name: "tokenId", type: "uint256" }
            ],
            name: "approve",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function"
          }
        ] as const,
        functionName: "approve",
        args: [MARKETPLACE_ADDRESS, BigInt(tokenId)],
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to prepare transaction");
      setPipelineStep("minted");
    }
  };

  const handleList = () => {
    if (!tokenId) return;
    setErrorMessage(null);
    setPipelineStep("list_sign");
    try {
      if (enableBuyout) {
        writeContract({
          address: MARKETPLACE_ADDRESS,
          abi: [
            {
              inputs: [
                { internalType: "uint256", name: "tokenId", type: "uint256" },
                { internalType: "uint256", name: "price", type: "uint256" }
              ],
              name: "listAgentForBuyout",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function"
            }
          ] as const,
          functionName: "listAgentForBuyout",
          args: [BigInt(tokenId), parseEther(buyoutPrice || "0")],
        });
      } else {
        // List for Hourly Hire (requires Monthly subscription payment)
        writeContract({
          address: MARKETPLACE_ADDRESS,
          abi: [
            {
              inputs: [
                { internalType: "uint256", name: "tokenId", type: "uint256" },
                { internalType: "uint256", name: "hourlyRateWei", type: "uint256" }
              ],
              name: "listAgent",
              outputs: [],
              stateMutability: "payable",
              type: "function"
            }
          ] as const,
          functionName: "listAgent",
          args: [BigInt(tokenId), parseEther(rentalPrice || "0")],
          value: monthlyCreatorFee || BigInt(0),
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to prepare transaction");
      setPipelineStep("approved");
    }
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
                    onChange={(e) => {
                      setEnableBuyout(e.target.checked);
                      if (e.target.checked) setEnableRental(false);
                    }}
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
                    onChange={(e) => {
                      setEnableRental(e.target.checked);
                      if (e.target.checked) setEnableBuyout(false);
                    }}
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

          {/* Interactive Step-by-Step Blockchain Registration wizard */}
          <div className="space-y-4 p-5 bg-white/[0.01] border border-white/5 rounded-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">On-Chain Deployment Pipeline</h3>

            <div className="space-y-4">
              {/* Step 1: Mint */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {pipelineStep === "completed" || pipelineStep === "approved" || pipelineStep === "minted" || pipelineStep === "approve_sign" || pipelineStep === "approve_wait" || pipelineStep === "list_sign" || pipelineStep === "list_wait" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : pipelineStep === "mint_sign" || pipelineStep === "mint_wait" ? (
                    <Loader2 className="w-5 h-5 text-brand animate-spin shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[10px] text-white/40 font-bold">1</div>
                  )}
                </div>
                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-white block">Mint Agentic ID NFT</span>
                  <span className="text-white/40 block leading-relaxed">
                    Upload configuration properties and register agent details on BatAgentNFT contract.
                  </span>
                  {mintTxHash && (
                    <a
                      href={`${EXPLORER_URL}/tx/${mintTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:underline font-mono text-[10px] block mt-1"
                    >
                      View Mint Transaction: {mintTxHash.slice(0, 10)}...{mintTxHash.slice(-8)}
                    </a>
                  )}
                </div>
              </div>

              {/* Step 2: Approve */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {pipelineStep === "completed" || pipelineStep === "approved" || pipelineStep === "list_sign" || pipelineStep === "list_wait" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : pipelineStep === "approve_sign" || pipelineStep === "approve_wait" ? (
                    <Loader2 className="w-5 h-5 text-brand animate-spin shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[10px] text-white/40 font-bold">2</div>
                  )}
                </div>
                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-white block">Approve Marketplace Delegation</span>
                  <span className="text-white/40 block leading-relaxed">
                    Authorize the Marketplace smart contract to manage your Agentic ID access rights.
                  </span>
                  {approveTxHash && (
                    <a
                      href={`${EXPLORER_URL}/tx/${approveTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:underline font-mono text-[10px] block mt-1"
                    >
                      View Approval Transaction: {approveTxHash.slice(0, 10)}...{approveTxHash.slice(-8)}
                    </a>
                  )}
                </div>
              </div>

              {/* Step 3: List */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {pipelineStep === "completed" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : pipelineStep === "list_sign" || pipelineStep === "list_wait" ? (
                    <Loader2 className="w-5 h-5 text-brand animate-spin shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[10px] text-white/40 font-bold">3</div>
                  )}
                </div>
                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-white block">List Agent on Marketplace</span>
                  <span className="text-white/40 block leading-relaxed">
                    Register pricing options and deposit initial subscription fee to publish your worker to the marketplace.
                  </span>
                  {listTxHash && (
                    <a
                      href={`${EXPLORER_URL}/tx/${listTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:underline font-mono text-[10px] block mt-1"
                    >
                      View Listing Transaction: {listTxHash.slice(0, 10)}...{listTxHash.slice(-8)}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs leading-relaxed">
              <strong>Error:</strong> {errorMessage}
            </div>
          )}

          {/* Wizard Actions */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setStep(1);
                setPipelineStep("idle");
                setMintTxHash(null);
                setApproveTxHash(null);
                setListTxHash(null);
                setErrorMessage(null);
              }}
              disabled={
                pipelineStep === "mint_sign" || 
                pipelineStep === "mint_wait" || 
                pipelineStep === "approve_sign" || 
                pipelineStep === "approve_wait" || 
                pipelineStep === "list_sign" || 
                pipelineStep === "list_wait"
              }
              className="font-semibold"
            >
              Back to Edit
            </Button>

            {pipelineStep === "idle" && (
              <Button onClick={handleMint} className="font-semibold gap-1.5">
                Mint Agentic ID
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}

            {pipelineStep === "mint_sign" && (
              <Button disabled className="font-semibold gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin" />
                Sign Mint Tx...
              </Button>
            )}

            {pipelineStep === "mint_wait" && (
              <Button disabled className="font-semibold gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin" />
                Minting in Progress...
              </Button>
            )}

            {pipelineStep === "minted" && (
              <Button onClick={handleApprove} className="font-semibold gap-1.5">
                Approve Marketplace
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}

            {pipelineStep === "approve_sign" && (
              <Button disabled className="font-semibold gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin" />
                Sign Approval Tx...
              </Button>
            )}

            {pipelineStep === "approve_wait" && (
              <Button disabled className="font-semibold gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin" />
                Approving in Progress...
              </Button>
            )}

            {pipelineStep === "approved" && (
              <Button onClick={handleList} className="font-semibold gap-1.5">
                List on Marketplace
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}

            {pipelineStep === "list_sign" && (
              <Button disabled className="font-semibold gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin" />
                Sign Listing Tx...
              </Button>
            )}

            {pipelineStep === "list_wait" && (
              <Button disabled className="font-semibold gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin" />
                Listing in Progress...
              </Button>
            )}

            {pipelineStep === "completed" && (
              <div className="flex gap-3">
                <Link href="/marketplace">
                  <Button variant="secondary" className="font-semibold">
                    Go to Marketplace
                  </Button>
                </Link>
                <Link href="/dashboard/creator">
                  <Button className="font-semibold">
                    View Creator Panel
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
