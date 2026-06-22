"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  useAccount, 
  usePublicClient, 
  useSignMessage 
} from "wagmi";
import { 
  MessageSquare, 
  Plus, 
  Upload, 
  Trash2, 
  Settings, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  Send, 
  Loader2, 
  ArrowLeft, 
  FileText, 
  HelpCircle,
  Eye,
  RefreshCw,
  Sliders,
  History,
  FileCode
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  workspaceService, 
  WorkspaceChat, 
  WorkspaceDocument, 
  WorkspaceSettings 
} from "@/lib/workspaceService";
import Link from "next/link";
import { formatEther } from "viem";
import { PricingPanel } from "@/components/agent/PricingPanel";

const NFT_ADDRESS = (process.env.NEXT_PUBLIC_AGENT_NFT_ADDRESS || "0xBA3A7aAf2490bD66CB42ba74e8bf2c55e115E920") as `0x${string}`;
const MARKETPLACE_ADDRESS = (process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "0x378B76beE85dcc4998ED099ED3373C8438e73958") as `0x${string}`;
const ACCESS_CONTROL_ADDRESS = (process.env.NEXT_PUBLIC_ACCESS_CONTROL_ADDRESS || "0xDC140d2B1429878D81F1CB65ab134839d01aB29A") as `0x${string}`;

const NFT_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getAgent",
    outputs: [
      {
        components: [
          { internalType: "address", name: "creator", type: "address" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "category", type: "string" },
          { internalType: "string", name: "metadataURI", type: "string" },
          { internalType: "bytes32", name: "metadataHash", type: "bytes32" },
          { internalType: "bytes32", name: "encryptedDataHash", type: "bytes32" },
          { internalType: "bool", name: "active", type: "bool" },
          { internalType: "uint256", name: "createdAt", type: "uint256" }
        ],
        internalType: "struct BatAgentNFT.AgentData",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

const ACCESS_ABI = [
  {
    inputs: [
      { internalType: "address", name: "buyer", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" }
    ],
    name: "hasAccess",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

const MARKETPLACE_HIRE_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "address", name: "", type: "address" }
    ],
    name: "hiredUntil",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

const ACCESS_CONTROL_RENT_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "address", name: "", type: "address" }
    ],
    name: "rentedUntil",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

const MARKETPLACE_LISTING_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "listings",
    outputs: [
      { internalType: "address", name: "seller", type: "address" },
      { internalType: "uint256", name: "price", type: "uint256" },
      { internalType: "uint256", name: "hourlyRateWei", type: "uint256" },
      { internalType: "bool", name: "active", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  }
] as const;

export default function AgentWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const publicClient = usePublicClient();
  const { signMessageAsync } = useSignMessage();

  const idStr = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const tokenId = idStr ? BigInt(idStr) : BigInt(1);

  // Workspace Local State
  const [workspace, setWorkspace] = useState(() => workspaceService.getWorkspace(idStr || "1"));
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);

  // Mobile navigation workspace tabs
  const [mobileTab, setMobileTab] = useState<"chat" | "docs" | "history" | "settings">("chat");

  // Blockchain Data State
  const [agentData, setAgentData] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isLoadingBlockchain, setIsLoadingBlockchain] = useState(true);
  const [listing, setListing] = useState<any>(null);

  // Timer Countdown state
  const [countdownStr, setCountdownStr] = useState("Loading...");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch blockchain validation data
  const verifyAccessAndLoad = async () => {
    if (!publicClient || !address) return;
    setIsLoadingBlockchain(true);
    try {
      const info = await publicClient.readContract({
        address: NFT_ADDRESS,
        abi: NFT_ABI,
        functionName: "getAgent",
        args: [tokenId],
      });
      setAgentData(info);

      const tokenOwner = await publicClient.readContract({
        address: NFT_ADDRESS,
        abi: NFT_ABI,
        functionName: "ownerOf",
        args: [tokenId],
      });
      const ownerStatus = tokenOwner.toLowerCase() === address.toLowerCase();
      setIsOwner(ownerStatus);

      try {
        const listData = await publicClient.readContract({
          address: MARKETPLACE_ADDRESS,
          abi: MARKETPLACE_LISTING_ABI,
          functionName: "listings",
          args: [tokenId],
        });
        setListing(listData);
      } catch {}

      let hasAccess = ownerStatus;
      if (!hasAccess) {
        try {
          hasAccess = await publicClient.readContract({
            address: MARKETPLACE_ADDRESS,
            abi: ACCESS_ABI,
            functionName: "hasAccess",
            args: [address, tokenId],
          });
        } catch {}
      }
      if (!hasAccess) {
        try {
          hasAccess = await publicClient.readContract({
            address: ACCESS_CONTROL_ADDRESS,
            abi: ACCESS_ABI,
            functionName: "hasAccess",
            args: [address, tokenId],
          });
        } catch {}
      }

      let expiry = 0;
      if (!ownerStatus) {
        let hiredUntilVal = BigInt(0);
        try {
          hiredUntilVal = await publicClient.readContract({
            address: MARKETPLACE_ADDRESS,
            abi: MARKETPLACE_HIRE_ABI,
            functionName: "hiredUntil",
            args: [tokenId, address],
          });
        } catch {}

        let rentedUntilVal = BigInt(0);
        try {
          rentedUntilVal = await publicClient.readContract({
            address: ACCESS_CONTROL_ADDRESS,
            abi: ACCESS_CONTROL_RENT_ABI,
            functionName: "rentedUntil",
            args: [tokenId, address],
          });
        } catch {}

        const maxVal = hiredUntilVal > rentedUntilVal ? hiredUntilVal : rentedUntilVal;
        expiry = Number(maxVal);
      }

      setExpiresAt(expiry);
      setIsActive(ownerStatus || (expiry * 1000 > Date.now()));
    } catch (err) {
      console.error("Error verifying workspace access:", err);
    } finally {
      setIsLoadingBlockchain(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      verifyAccessAndLoad();
    }
  }, [isConnected, address, publicClient]);

  // Countdown timer countdown
  useEffect(() => {
    if (isLoadingBlockchain) return;

    const interval = setInterval(() => {
      if (isOwner) {
        setCountdownStr("Unlimited (Owner)");
        setIsActive(true);
        return;
      }
      if (expiresAt === 0) {
        setCountdownStr("No access record");
        setIsActive(false);
        return;
      }

      const diff = expiresAt * 1000 - Date.now();
      if (diff <= 0) {
        setCountdownStr("Expired");
        setIsActive(false);
      } else {
        setIsActive(true);
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setCountdownStr(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, isOwner, isLoadingBlockchain]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [workspace, activeChatId, mobileTab]);

  useEffect(() => {
    if (workspace.chats.length > 0 && !activeChatId) {
      setActiveChatId(workspace.chats[0].id);
    }
  }, [workspace, activeChatId]);

  const getSignature = async () => {
    if (signature) return signature;
    setIsSigning(true);
    try {
      const sig = await signMessageAsync({
        message: `Access Bat Agent ${idStr}`,
      });
      setSignature(sig);
      setIsSigning(false);
      return sig;
    } catch (err) {
      setIsSigning(false);
      throw err;
    }
  };

  const handleStartNewChat = () => {
    const newChat = workspaceService.createChat(idStr || "1");
    setWorkspace(workspaceService.getWorkspace(idStr || "1"));
    setActiveChatId(newChat.id);
    setMobileTab("chat");
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSending || !activeChatId || !isActive) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setIsSending(true);

    let sig = signature;
    if (!sig) {
      try {
        sig = await getSignature();
      } catch (err) {
        console.error("Signature rejection:", err);
        setIsSending(false);
        return;
      }
    }

    workspaceService.addMessage(idStr || "1", activeChatId, "user", userMsg);
    let updatedWorkspace = workspaceService.getWorkspace(idStr || "1");
    setWorkspace(updatedWorkspace);

    const chat = updatedWorkspace.chats.find(c => c.id === activeChatId);
    if (!chat) {
      setIsSending(false);
      return;
    }

    try {
      let messagesToSend = chat.messages.map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));

      if (workspace.settings.documentUsage !== "never") {
        const linkedDocs = workspace.documents.filter(d => chat.linkedDocuments.includes(d.id));
        if (linkedDocs.length > 0) {
          const contextStr = `[Buyer Private Workspace context]\nYou have access to the following reference documents uploaded privately by the buyer in their workspace. Use their details to answer the user request if applicable:\n` +
            linkedDocs.map(d => `--- File: ${d.name} ---\n${d.content}\n`).join("\n") +
            `\n[End of Context]\n`;
          
          if (messagesToSend.length > 0) {
            const lastIdx = messagesToSend.length - 1;
            messagesToSend[lastIdx].content = contextStr + messagesToSend[lastIdx].content;
          }
        }
      }

      messagesToSend.unshift({
        role: "user",
        content: `System Instructions: You are in a private agent workspace environment. Please output responses following style: ${workspace.settings.responseStyle} and format: ${workspace.settings.outputFormat}.`
      });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messagesToSend,
          model: "qwen2.5-omni",
          tokenId: idStr,
          buyer: address,
          signature: sig,
        }),
      });

      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(responseData.error || "Failed to process chat completion.");
      }

      const agentReply = responseData.choices?.[0]?.message?.content || "No completion response returned.";
      workspaceService.addMessage(idStr || "1", activeChatId, "assistant", agentReply);
      setWorkspace(workspaceService.getWorkspace(idStr || "1"));
    } catch (err: any) {
      console.error("Chat completed with errors:", err);
      workspaceService.addMessage(idStr || "1", activeChatId, "assistant", `Error: ${err.message || "Failed to query agent compute node."}`);
      setWorkspace(workspaceService.getWorkspace(idStr || "1"));
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      workspaceService.addDocument(idStr || "1", file.name, file.name.split(".").pop() || "txt", file.size, content);
      setWorkspace(workspaceService.getWorkspace(idStr || "1"));
    };
    reader.readAsText(file);
  };

  const handleDeleteDocument = (docId: string) => {
    workspaceService.deleteDocument(idStr || "1", docId);
    setWorkspace(workspaceService.getWorkspace(idStr || "1"));
  };

  const handleToggleDocLink = (docId: string) => {
    if (!activeChatId) return;
    const chat = workspace.chats.find(c => c.id === activeChatId);
    if (!chat) return;

    if (chat.linkedDocuments.includes(docId)) {
      workspaceService.unlinkDocFromChat(idStr || "1", activeChatId, docId);
    } else {
      workspaceService.linkDocToChat(idStr || "1", activeChatId, docId);
    }
    setWorkspace(workspaceService.getWorkspace(idStr || "1"));
  };

  const activeChat = workspace.chats.find(c => c.id === activeChatId);

  if (!isConnected) {
    return (
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center w-full">
        <Card hoverable={false} className="max-w-xl w-full border border-white/5 p-8 text-center space-y-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
            <Settings className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Wallet Connection Required</h3>
            <p className="text-sm text-white/50 leading-relaxed">
              Connect your wallet using the header button to review your purchased, rented, or PPM-enabled assistants.
            </p>
          </div>
        </Card>
      </main>
    );
  }

  if (isLoadingBlockchain) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <Loader2 className="w-12 h-12 text-brand animate-spin" />
        <p className="text-white/50 text-sm font-semibold">Loading Private Workspace from 0G Galileo Testnet...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] w-full text-white bg-zinc-950">
      
      {/* ======================================================== */}
      {/* MOBILE APP LAYOUT (lg:hidden)                            */}
      {/* ======================================================== */}
      <div className="lg:hidden flex flex-col flex-grow w-full relative">
        {/* Top App Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-white/5 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/dashboard/buyer")} className="p-1 -ml-1 text-white/60 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm text-white truncate max-w-[120px]">{agentData?.name || "Workspace"}</h3>
              <span className="text-[9px] text-[#EA6002] font-semibold flex items-center gap-1 font-mono">
                <Clock className="w-2.5 h-2.5" /> {countdownStr}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="ghost" onClick={verifyAccessAndLoad} className="text-white/40 h-7 w-7 p-0 flex items-center justify-center">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" onClick={() => setShowRenewModal(true)} className="h-7 px-2.5 font-bold text-[10px]">
              Renew
            </Button>
          </div>
        </div>

        {/* Access Paused Guard (Mobile) */}
        {!isActive ? (
          <div className="flex-grow flex flex-col items-center justify-center p-6 text-center space-y-6">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Your agent is paused.</h3>
              <p className="text-xs text-white/50 leading-relaxed max-w-sm">
                Your paid access to this agent has expired. Chats, files, and work history are safe. Renew your subscription to continue working.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <Button onClick={() => setShowRenewModal(true)} className="w-full font-bold">
                Renew Access License
              </Button>
              <Button variant="secondary" onClick={() => router.push("/marketplace")} className="w-full font-bold">
                Back to Marketplace
              </Button>
            </div>
          </div>
        ) : (
          /* Dynamic Tab Panel content */
          <div className="flex-grow flex flex-col justify-between pb-16">
            {/* Tab: Chat */}
            {mobileTab === "chat" && (
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-220px)]">
                  {activeChat ? (
                    activeChat.messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center space-y-4 py-16 max-w-xs mx-auto">
                        <SparklesIcon className="w-10 h-10 text-brand/60" />
                        <div className="space-y-1">
                          <h3 className="font-bold text-sm text-white">Session Initialized</h3>
                          <p className="text-[11px] text-white/40 leading-relaxed">
                            Start talking with {agentData?.name || "your agent"}. Check reference documents in the Docs tab to inject context.
                          </p>
                        </div>
                      </div>
                    ) : (
                      activeChat.messages.map((m, idx) => (
                        <div
                          key={idx}
                          className={`flex gap-3 max-w-[85%] ${
                            m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-[9px] font-bold ${
                              m.role === "user" 
                                ? "bg-brand/20 border border-brand/40 text-brand" 
                                : "bg-white/5 border border-white/10 text-white/80"
                            }`}
                          >
                            {m.role === "user" ? "ME" : "AG"}
                          </div>
                          <div
                            className={`px-3 py-2 rounded-xl border text-xs leading-relaxed ${
                              m.role === "user"
                                ? "bg-brand/5 border-brand/20 text-white"
                                : "bg-white/[0.02] border-white/5 text-white/90"
                            }`}
                          >
                            {m.content}
                          </div>
                        </div>
                      ))
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-white/40 text-xs">
                      <MessageSquare className="w-8 h-8 text-white/20 mb-2" />
                      <p>Select or start a chat session</p>
                    </div>
                  )}

                  {isSigning && (
                    <div className="flex items-center gap-2 text-[10px] text-brand bg-brand/5 border border-brand/20 p-2.5 rounded-lg">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Wallet signature required...</span>
                    </div>
                  )}

                  {isSending && (
                    <div className="flex gap-2 mr-auto items-center">
                      <Loader2 className="w-3.5 h-3.5 text-brand animate-spin" />
                      <span className="text-[10px] text-white/40 italic">Querying TEE...</span>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Sticky input */}
                <form onSubmit={handleSendChat} className="p-3 border-t border-white/5 bg-[#0C0C12] flex gap-2 fixed bottom-16 inset-x-0 z-20 safe-bottom">
                  <input
                    disabled={!activeChatId || isSending || isSigning}
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      !activeChatId 
                        ? "Select a chat session..." 
                        : "Type a message..."
                    }
                    className="flex-1 bg-white/5 border border-white/5 focus:border-brand/40 focus:outline-none rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30"
                  />
                  <Button
                    type="submit"
                    disabled={!chatInput.trim() || isSending || isSigning || !activeChatId}
                    className="px-3 py-2 rounded-xl font-bold shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </div>
            )}

            {/* Tab: Docs */}
            {mobileTab === "docs" && (
              <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-160px)]">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-white/70 uppercase">Reference Documents</span>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={() => fileInputRef.current?.click()} 
                    className="h-7 px-2.5 text-[10px] gap-1 font-bold"
                  >
                    <Upload className="w-3 h-3" />
                    Upload File
                  </Button>
                </div>

                {workspace.documents.length === 0 ? (
                  <div className="py-12 text-center text-white/30 italic text-xs border border-dashed border-white/5 rounded-xl">
                    No documents uploaded
                  </div>
                ) : (
                  <div className="space-y-2">
                    {workspace.documents.map((d) => {
                      const isLinked = activeChat?.linkedDocuments.includes(d.id);
                      return (
                        <div
                          key={d.id}
                          className="p-3 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between gap-3 text-xs"
                        >
                          <button
                            onClick={() => handleToggleDocLink(d.id)}
                            className={`flex items-center gap-2 text-left truncate flex-1 font-semibold transition-colors ${
                              isLinked ? "text-brand" : "text-white/60"
                            }`}
                          >
                            <FileText className="w-4 h-4 shrink-0" />
                            <span className="truncate">{d.name}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(d.id)}
                            className="text-white/30 hover:text-red-400 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab: History */}
            {mobileTab === "history" && (
              <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-160px)]">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-white/70 uppercase">Chat Sessions</span>
                  <Button size="sm" onClick={handleStartNewChat} className="h-7 px-2.5 text-[10px] gap-1 font-bold">
                    <Plus className="w-3 h-3" />
                    New Session
                  </Button>
                </div>

                {workspace.chats.length === 0 ? (
                  <div className="py-12 text-center text-white/30 italic text-xs border border-dashed border-white/5 rounded-xl">
                    No sessions initialized
                  </div>
                ) : (
                  <div className="space-y-2">
                    {workspace.chats.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setActiveChatId(c.id);
                          setMobileTab("chat");
                        }}
                        className={`w-full text-left p-3 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                          activeChatId === c.id 
                            ? "bg-brand/10 border border-brand/20 text-white" 
                            : "bg-white/[0.01] border border-white/5 text-white/60"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <MessageSquare className="w-4 h-4 text-brand/70" />
                          <span className="truncate">{c.title}</span>
                        </div>
                        <span className="text-[10px] text-white/30 font-mono">
                          {new Date(c.timestamp).toLocaleDateString()}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Settings */}
            {mobileTab === "settings" && (
              <div className="p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-160px)]">
                <span className="text-xs font-bold text-white/70 uppercase block border-b border-white/5 pb-2">Persona Tuning</span>
                
                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <span className="text-white/40 font-semibold block">Response Style</span>
                    <select
                      value={workspace.settings.responseStyle}
                      onChange={(e) => {
                        const style = e.target.value as any;
                        const updated = workspaceService.updateSettings(idStr || "1", { responseStyle: style });
                        setWorkspace({ ...workspace, settings: updated });
                      }}
                      className="w-full bg-[#12121A] border border-white/5 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-brand/40"
                    >
                      <option value="simple">Simple</option>
                      <option value="professional">Professional</option>
                      <option value="detailed">Detailed</option>
                      <option value="friendly">Friendly</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-white/40 font-semibold block">Output Format</span>
                    <select
                      value={workspace.settings.outputFormat}
                      onChange={(e) => {
                        const format = e.target.value as any;
                        const updated = workspaceService.updateSettings(idStr || "1", { outputFormat: format });
                        setWorkspace({ ...workspace, settings: updated });
                      }}
                      className="w-full bg-[#12121A] border border-white/5 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-brand/40"
                    >
                      <option value="normal">Normal</option>
                      <option value="checklist">Checklist</option>
                      <option value="table">Table</option>
                      <option value="report">Report</option>
                      <option value="code">Code block</option>
                      <option value="markdown">Markdown styling</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-white/40 font-semibold block">Document Context Mode</span>
                    <select
                      value={workspace.settings.documentUsage}
                      onChange={(e) => {
                        const docMode = e.target.value as any;
                        const updated = workspaceService.updateSettings(idStr || "1", { documentUsage: docMode });
                        setWorkspace({ ...workspace, settings: updated });
                      }}
                      className="w-full bg-[#12121A] border border-white/5 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-brand/40"
                    >
                      <option value="always">Always Use Enabled Files</option>
                      <option value="ask first">Ask First</option>
                      <option value="never">Never Use Files</option>
                    </select>
                  </div>

                  <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-white">Short-term Memory</span>
                      <p className="text-[10px] text-white/40">Enable conversation context history</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={workspace.settings.memory}
                      onChange={(e) => {
                        const updated = workspaceService.updateSettings(idStr || "1", { memory: e.target.checked });
                        setWorkspace({ ...workspace, settings: updated });
                      }}
                      className="accent-brand w-4 h-4"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mobile bottom workspace tab selectors */}
        {isActive && (
          <div className="fixed bottom-0 inset-x-0 h-14 bg-zinc-900 border-t border-white/5 flex items-center justify-around z-30 safe-bottom">
            <button
              onClick={() => setMobileTab("chat")}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                mobileTab === "chat" ? "text-[#EA6002]" : "text-white/50"
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-[9px] font-semibold mt-0.5">Chat</span>
            </button>
            <button
              onClick={() => setMobileTab("docs")}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                mobileTab === "docs" ? "text-[#EA6002]" : "text-white/50"
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-[9px] font-semibold mt-0.5">Docs</span>
            </button>
            <button
              onClick={() => setMobileTab("history")}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                mobileTab === "history" ? "text-[#EA6002]" : "text-white/50"
              }`}
            >
              <History className="w-5 h-5" />
              <span className="text-[9px] font-semibold mt-0.5">History</span>
            </button>
            <button
              onClick={() => setMobileTab("settings")}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                mobileTab === "settings" ? "text-[#EA6002]" : "text-white/50"
              }`}
            >
              <Sliders className="w-5 h-5" />
              <span className="text-[9px] font-semibold mt-0.5">Settings</span>
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* DESKTOP APP LAYOUT (hidden lg:flex)                       */}
      {/* ======================================================== */}
      <div className="hidden lg:flex flex-row flex-grow w-full">
        {/* 1. Left Control Panel / Sidebar */}
        <div className="w-80 border-r border-white/5 p-5 flex flex-col justify-between shrink-0 space-y-6">
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Link href="/dashboard/buyer">
                <Button variant="ghost" size="sm" className="flex items-center gap-1 -ml-2 text-white/50 hover:text-white">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Dashboard
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={verifyAccessAndLoad} className="text-white/40 hover:text-white flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                Sync Access
              </Button>
            </div>

            {/* Agent Info card */}
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center font-bold text-brand">
                  {agentData?.name?.substring(0, 2).toUpperCase()}
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-bold text-sm text-white">{agentData?.name || "AI Agent"}</h3>
                  <span className="text-[10px] text-white/40 block font-mono">Token ID: #{idStr}</span>
                </div>
              </div>

              {/* Countdown timer */}
              <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-white/50">
                  <Clock className="w-3.5 h-3.5 text-brand" />
                  <span>Time Left:</span>
                </div>
                <span className={`font-mono font-bold ${isActive ? "text-emerald-400" : "text-red-400"}`}>
                  {countdownStr}
                </span>
              </div>

              {!isActive && (
                <Button size="sm" onClick={() => setShowRenewModal(true)} className="w-full font-semibold mt-1">
                  Renew Access
                </Button>
              )}
            </div>

            {/* Chat History List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Chat Sessions</span>
                <Button size="sm" onClick={handleStartNewChat} className="h-6 px-2 text-[10px] gap-1 font-semibold">
                  <Plus className="w-3 h-3" />
                  New Chat
                </Button>
              </div>

              {workspace.chats.length === 0 ? (
                <span className="text-xs text-white/30 italic block py-4 text-center border border-dashed border-white/5 rounded-lg">
                  No active chat sessions
                </span>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {workspace.chats.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveChatId(c.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between group transition-colors ${
                        activeChatId === c.id 
                          ? "bg-brand/10 border border-brand/20 text-white" 
                          : "bg-white/[0.01] border border-white/5 text-white/60 hover:text-white hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MessageSquare className="w-3.5 h-3.5 text-brand/70" />
                        <span className="truncate">{c.title}</span>
                      </div>
                      <span className="text-[9px] text-white/30 font-mono">
                        {new Date(c.timestamp).toLocaleDateString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reference Document uploads */}
            <div className="space-y-3 pt-3 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Reference Docs</span>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => fileInputRef.current?.click()} 
                  className="h-6 px-2 text-[10px] gap-1 font-semibold"
                >
                  <Upload className="w-3 h-3" />
                  Upload
                </Button>
              </div>

              {workspace.documents.length === 0 ? (
                <span className="text-xs text-white/30 italic block py-4 text-center border border-dashed border-white/5 rounded-lg">
                  No uploaded reference files
                </span>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {workspace.documents.map((d) => {
                    const isLinked = activeChat?.linkedDocuments.includes(d.id);
                    return (
                      <div
                        key={d.id}
                        className="px-2 py-1.5 rounded-lg border border-white/5 bg-white/[0.01] flex items-center justify-between gap-2 text-xs"
                      >
                        <button
                          onClick={() => handleToggleDocLink(d.id)}
                          className={`flex items-center gap-2 text-left truncate flex-1 font-medium transition-colors ${
                            isLinked ? "text-brand hover:text-brand/80" : "text-white/50 hover:text-white"
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate" title={d.name}>{d.name}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(d.id)}
                          className="text-white/30 hover:text-red-400 p-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <span className="text-[9px] text-white/30 block leading-relaxed italic">
                * Files are parsed and retained solely inside browser storage. Creators cannot access buyer documents.
              </span>
            </div>

          </div>

          <div className="pt-4 border-t border-white/5 flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSettings(!showSettings)} 
              className="w-full font-semibold gap-1.5"
            >
              <Settings className="w-4 h-4" />
              Workspace Settings
            </Button>
          </div>

        </div>

        {/* 2. Main Chat Area / Expired Lock overlay */}
        <div className="flex-1 flex flex-col justify-between bg-zinc-950 relative min-h-[400px]">
          {showSettings && (
            <div className="absolute inset-x-0 top-0 bg-[#0C0E12] border-b border-white/5 p-5 z-20 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Workspace Persona Tuning</h4>
                <Button size="sm" variant="ghost" onClick={() => setShowSettings(false)}>Close</Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1.5">
                  <span className="text-white/40 font-semibold block">Response Style:</span>
                  <select
                    value={workspace.settings.responseStyle}
                    onChange={(e) => {
                      const style = e.target.value as any;
                      const updated = workspaceService.updateSettings(idStr || "1", { responseStyle: style });
                      setWorkspace({ ...workspace, settings: updated });
                    }}
                    className="w-full bg-[#12121A] border border-white/5 rounded px-2.5 py-1.5 text-white"
                  >
                    <option value="simple">Simple</option>
                    <option value="professional">Professional</option>
                    <option value="detailed">Detailed</option>
                    <option value="friendly">Friendly</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <span className="text-white/40 font-semibold block">Output Format:</span>
                  <select
                    value={workspace.settings.outputFormat}
                    onChange={(e) => {
                      const format = e.target.value as any;
                      const updated = workspaceService.updateSettings(idStr || "1", { outputFormat: format });
                      setWorkspace({ ...workspace, settings: updated });
                    }}
                    className="w-full bg-[#12121A] border border-white/5 rounded px-2.5 py-1.5 text-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="checklist">Checklist</option>
                    <option value="table">Table</option>
                    <option value="report">Report</option>
                    <option value="code">Code block</option>
                    <option value="markdown">Markdown styling</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <span className="text-white/40 font-semibold block">Document Context:</span>
                  <select
                    value={workspace.settings.documentUsage}
                    onChange={(e) => {
                      const docMode = e.target.value as any;
                      const updated = workspaceService.updateSettings(idStr || "1", { documentUsage: docMode });
                      setWorkspace({ ...workspace, settings: updated });
                    }}
                    className="w-full bg-[#12121A] border border-white/5 rounded px-2.5 py-1.5 text-white"
                  >
                    <option value="always">Always Use Enabled Files</option>
                    <option value="ask first">Ask First</option>
                    <option value="never">Never Use Files</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <span className="text-white/40 font-semibold block">State Retention:</span>
                  <div className="flex items-center gap-2 pt-1.5">
                    <input
                      type="checkbox"
                      checked={workspace.settings.memory}
                      onChange={(e) => {
                        const updated = workspaceService.updateSettings(idStr || "1", { memory: e.target.checked });
                        setWorkspace({ ...workspace, settings: updated });
                      }}
                      className="accent-brand"
                    />
                    <span>Short-term Memory</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isActive ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto space-y-6 z-10">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <ShieldAlert className="w-8 h-8" />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-white">Your agent is paused.</h2>
                <p className="text-sm text-white/50 leading-relaxed">
                  Your paid access to this agent has expired. Your chats, files, and work history are still safe. Renew your subscription or buy more hours to continue working with this agent.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Button onClick={() => setShowRenewModal(true)} className="flex-1 font-semibold">
                  Renew Access License
                </Button>
                <Link href="/marketplace" className="flex-1">
                  <Button variant="secondary" className="w-full font-semibold">
                    Back to Marketplace
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Messages Display */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[calc(100vh-180px)]">
                {activeChat ? (
                  activeChat.messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-24 max-w-md mx-auto">
                      <SparklesIcon className="w-10 h-10 text-brand/60" />
                      <div className="space-y-1">
                        <h3 className="font-bold text-white">Session Initialized</h3>
                        <p className="text-xs text-white/40 leading-relaxed">
                          Start talking with {agentData?.name || "your agent"}. Reference documents checked in the sidebar will be injected as context automatically.
                        </p>
                      </div>
                    </div>
                  ) : (
                    activeChat.messages.map((m, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-3 max-w-3xl ${
                          m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold ${
                            m.role === "user" 
                              ? "bg-brand/20 border border-brand/40 text-brand" 
                              : "bg-white/5 border border-white/10 text-white/80"
                          }`}
                        >
                          {m.role === "user" ? "ME" : "AG"}
                        </div>
                        <div
                          className={`px-4 py-2.5 rounded-xl border text-sm leading-relaxed ${
                            m.role === "user"
                              ? "bg-brand/5 border-brand/20 text-white"
                              : "bg-white/[0.02] border-white/5 text-white/90"
                          }`}
                        >
                          {m.content}
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-24">
                    <MessageSquare className="w-10 h-10 text-white/20 mb-2" />
                    <p className="text-white/40 text-xs font-semibold">Select or start a new chat session to begin</p>
                  </div>
                )}

                {isSigning && (
                  <div className="flex items-center gap-2 text-xs text-brand bg-brand/5 border border-brand/20 p-3 rounded-lg max-w-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Wallet confirmation required: Sign the access check nonce...</span>
                  </div>
                )}

                {isSending && (
                  <div className="flex gap-3 mr-auto max-w-xs items-center">
                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-brand animate-spin" />
                    </div>
                    <span className="text-xs text-white/40 italic">Querying TEE Node...</span>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendChat} className="p-4 border-t border-white/5 bg-[#0A0A0F] flex gap-3 z-10">
                <input
                  disabled={!activeChatId || isSending || isSigning}
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={
                    !activeChatId 
                      ? "Start a new chat to begin..." 
                      : "Type a message, reference documents are injected..."
                  }
                  className="flex-1 bg-white/5 border border-white/5 focus:border-brand/40 focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 transition-colors"
                />
                <Button
                  type="submit"
                  disabled={!chatInput.trim() || isSending || isSigning || !activeChatId}
                  className="px-4 py-3 rounded-xl font-bold gap-1.5 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  Send
                </Button>
              </form>
            </>
          )}

        </div>
      </div>

      {/* 3. Renewal Modal */}
      {showRenewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0F] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-6 relative">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">Renew Agent Access License</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowRenewModal(false);
                  verifyAccessAndLoad();
                }}
              >
                Close
              </Button>
            </div>

            {listing && listing[3] ? (
              <div className="space-y-4">
                <p className="text-xs text-white/50 leading-relaxed">
                  Renew your hourly access subscription contract on the 0G Galileo testnet to resume workspace communications.
                </p>

                <PricingPanel
                  tokenId={idStr || "1"}
                  buyoutPrice={listing[1] > BigInt(0) ? formatEther(listing[1]) : undefined}
                  rentalPrice={listing[2] > BigInt(0) ? formatEther(listing[2]) : undefined}
                  onSuccess={() => {
                    setShowRenewModal(false);
                    verifyAccessAndLoad();
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
                <p className="text-xs text-white/50 leading-relaxed">
                  The listing is currently inactive on the marketplace. Please ask the creator to list the agent or contact support.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// Sparkles Helper icon
function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 6z" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" />
    </svg>
  );
}
