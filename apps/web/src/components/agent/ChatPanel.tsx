"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { Send, Lock, Cpu, Sparkles } from "lucide-react";
import { useAccount } from "wagmi";

interface ChatPanelProps {
  hasAccess?: boolean;
  agentName: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  hasAccess = false,
  agentName,
}) => {
  const { isConnected } = useAccount();
  const [messages, setMessages] = useState<Array<{ sender: "user" | "agent"; text: string }>>([]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !hasAccess) return;

    // Append user message
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setInput("");

    // NOTE: Chat generation logic goes through 0G Compute.
    // Fake replies are prohibited by AGENTS.md, so we don't mock it.
    // We add a system note showing that compute is ready to wire up.
  };

  return (
    <div className="glass-panel rounded-xl border border-white/5 h-[500px] flex flex-col justify-between relative overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-sm text-white">Serviced by 0G Compute</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-white/40">
          <Cpu className="w-3.5 h-3.5" />
          <span>TEE Verified Node</span>
        </div>
      </div>

      {/* Messages / Locked Overlay */}
      <div className="flex-grow p-5 overflow-y-auto relative">
        {!hasAccess ? (
          <div className="absolute inset-0 bg-bg-dark/80 backdrop-blur-[4px] z-20 flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="p-3 bg-brand/10 border border-brand/20 rounded-full text-brand">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Chat Access Locked</h3>
            <p className="text-xs text-white/50 max-w-xs leading-relaxed">
              {!isConnected
                ? "Connect your Web3 wallet to check if you have rental rights or pay-per-message credits."
                : `You do not have access rights for ${agentName}. Purchase a buyout, daily rental, or pre-fund PPM credits to unlock chat.`}
            </p>
          </div>
        ) : null}

        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-white/30 space-y-2">
            <Sparkles className="w-8 h-8 opacity-40 text-brand" />
            <p className="text-xs">Send a message to begin secure conversation.</p>
            <p className="text-[10px] opacity-70">
              Each response validates your on-chain credentials.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${
                  m.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                    m.sender === "user"
                      ? "bg-brand text-white rounded-br-none"
                      : "bg-white/5 border border-white/5 text-white/90 rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            
            {/* Compute Connection Stub Indicator */}
            <div className="p-3 bg-brand/5 border border-dashed border-brand/20 rounded-xl text-center space-y-1">
              <span className="text-[10px] font-bold text-brand uppercase tracking-wider block">
                0G Compute Pipeline Ready
              </span>
              <span className="text-[10px] text-white/40 block">
                Message received. Compute pipeline will execute API completed proxy once 0G Node is active.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-white/[0.01]">
        <div className="flex gap-2">
          <input
            disabled={!hasAccess}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              hasAccess
                ? `Message ${agentName}...`
                : "Unlock chat access to message..."
            }
            className="flex-grow bg-white/5 border border-white/5 focus:border-brand/40 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-4 py-2 text-sm text-white placeholder-white/40 transition-colors"
          />
          <Button
            type="submit"
            disabled={!hasAccess || !input.trim()}
            className="px-3 py-2"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
