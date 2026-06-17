"use client";

import { useEffect, useMemo, useState } from "react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { useAccount, useProvider } from "@starknet-react/core";
import { CheckCircle2, Sparkles } from "lucide-react";
import type { Agent } from "@/types/agent";
import { cn } from "@/lib/utils";
import { uploadTaskProofTo0G } from "@/lib/0g";
import type { TaskProof } from "@/types/0g";
import {
  hasUserHiredAgentOnchain,
} from "@/lib/starknet-contract";
import {
  isContractConfigured,
  isPaymentTokenConfigured,
} from "@/lib/contracts";
import ProofCard from "@/components/0g/proof-card";
import ChatInput from "./chat-input";
import ChatMessage from "./chat-message";
import PaymentUnlockCard from "@/components/wallet/payment-unlock-card";
import { createTaskProofRecord } from "@/lib/db/proofs";
import { getLatestTransactionForAgentBuyer } from "@/lib/db/hires";

type AgentChatProps = {
  agent: Agent;
};

function createInitialMessages(agent: Agent): UIMessage[] {
  return [
    {
      id: "assistant-1",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: `I’m ${agent.name}. Share the task and I’ll work through it with you.`,
        },
      ],
    },
  ];
}

export default function AgentChat({ agent }: AgentChatProps) {
  const { account, address } = useAccount();
  const provider = useProvider();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [checkingHireStatus, setCheckingHireStatus] = useState(false);
  const [hireStatusError, setHireStatusError] = useState<string | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [taskProof, setTaskProof] = useState<TaskProof | null>(null);
  const [savingProof, setSavingProof] = useState(false);
  const initialMessages = useMemo(() => createInitialMessages(agent), [agent]);
  const onchainAgentId = agent.onchainAgentId ?? agent.slug;

  useEffect(() => {
    let cancelled = false;

    async function syncHireStatus() {
      if (!address) {
        setIsUnlocked(false);
        setHireStatusError(null);
        setCheckingHireStatus(false);
        return;
      }

      if (!isContractConfigured()) {
        setIsUnlocked(false);
        setHireStatusError(
          "BatAgents contract address is not configured. Add NEXT_PUBLIC_BATAGENTS_CONTRACT_ADDRESS after deployment.",
        );
        setCheckingHireStatus(false);
        return;
      }

      if (!isPaymentTokenConfigured()) {
        setIsUnlocked(false);
        setHireStatusError(
          "Payment token address is not configured. Add NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS after deployment.",
        );
        setCheckingHireStatus(false);
        return;
      }

      if (!agent.onchainRegistrationTxHash && !agent.onchainAgentId) {
        setIsUnlocked(false);
        setHireStatusError(
          "This agent is not registered onchain yet. It cannot be hired until the creator registers it.",
        );
        setCheckingHireStatus(false);
        return;
      }

      setCheckingHireStatus(true);
      setHireStatusError(null);

      try {
        const providerForReads = provider.provider;
        const hired = await hasUserHiredAgentOnchain({
          provider: providerForReads,
          agentSlug: agent.slug,
          agentOnchainId: onchainAgentId,
          buyerAddress: address,
        });

        if (!cancelled) {
          setIsUnlocked(hired);
        }
      } catch (error) {
        if (!cancelled) {
          setHireStatusError(
            error instanceof Error
              ? error.message
              : "Checking onchain hire status failed.",
          );
          setIsUnlocked(false);
        }
      } finally {
        if (!cancelled) {
          setCheckingHireStatus(false);
        }
      }
    }

    void syncHireStatus();

    return () => {
      cancelled = true;
    };
  }, [account, address, agent.onchainAgentId, agent.onchainRegistrationTxHash, agent.slug, onchainAgentId, provider]);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { agent },
    }),
    messages: initialMessages,
  });

  const isLoading = status === "submitted" || status === "streaming";

  async function handleSend(message: string) {
    setPendingPrompt(null);
    await sendMessage({ text: message });
  }

  async function saveTaskProof() {
    if (!address) {
      setHireStatusError("Connect your wallet before saving a task proof.");
      return;
    }

    setSavingProof(true);

    try {
      const paymentRecord = await getLatestTransactionForAgentBuyer(agent.id, address);
      const completedAt = new Date().toISOString();

      if (!paymentRecord?.txHash) {
        throw new Error("No confirmed payment transaction was found for this agent.");
      }

      const latestAssistantMessage = [...messages].reverse().find((message) => {
        return message.role === "assistant";
      });

      const latestTaskSummary =
        latestAssistantMessage?.parts
          .map((part) => (part.type === "text" ? part.text : ""))
          .join("")
          .trim() || `Completed task for ${agent.name}`;

      const storedProof = await uploadTaskProofTo0G({
        agentId: agent.id,
        buyerWallet: address,
        taskSummary: `Task completed with ${agent.name}`,
        resultSummary: latestTaskSummary,
        paymentTxHash: paymentRecord.txHash,
        completedAt,
      });

      setTaskProof({
        id: `task-proof-${agent.id}`,
        agentId: agent.id,
        buyerWallet: address,
        taskSummary: `Task completed with ${agent.name}`,
        resultSummary: latestTaskSummary,
        paymentTxHash: paymentRecord.txHash,
        proofRootHash: storedProof.rootHash,
        completedAt: storedProof.storedAt,
        url: storedProof.url,
        mode: storedProof.mode,
      });

      await createTaskProofRecord({
        id: `task-proof-${agent.id}`,
        agentId: agent.id,
        buyerWallet: address,
        taskSummary: `Task completed with ${agent.name}`,
        resultSummary: latestTaskSummary,
        paymentTxHash: paymentRecord.txHash,
        proofRootHash: storedProof.rootHash,
        completedAt: storedProof.storedAt,
      }, storedProof);
    } finally {
      setSavingProof(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_rgba(3,7,18,0.35)] backdrop-blur">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
                Live workspace
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-white">{agent.name}</h1>
              <p className="mt-2 text-sm text-slate-300">
                {agent.category} · {agent.service} · {agent.currency} {agent.price}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-3 py-2 text-xs font-medium",
                isUnlocked
                  ? "bg-emerald-400/10 text-emerald-200"
                  : checkingHireStatus
                    ? "bg-cyan-400/10 text-cyan-100"
                    : "bg-amber-400/10 text-amber-100",
              )}
            >
              {checkingHireStatus ? "Checking hire status" : isUnlocked ? "Unlocked" : "Locked"}
            </span>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-50">
            {hireStatusError ? (
              hireStatusError
            ) : isUnlocked ? (
              "Contract confirmed your hire. AI chat is unlocked by onchain proof."
            ) : (
              "Hire through BatAgents Cairo contract to unlock the live AI workspace."
            )}
          </div>
        </div>

        {isUnlocked ? (
          <>
            <div className="mt-5 min-h-[420px] space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {isLoading ? (
                <div className="flex justify-start">
                  <div className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                    <span className="inline-flex items-center gap-2">
                      <Sparkles className="h-4 w-4 animate-pulse text-cyan-300" />
                      Streaming response...
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-5">
              <ChatInput disabled={false} isLoading={isLoading} onSend={handleSend} />
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/60 p-6">
            <p className="text-sm font-medium text-white">
              Chat is locked until the contract confirms your hire.
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Connect a Starknet wallet and complete the Sepolia testnet hire on the
              right to unlock this agent workspace.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {agent.sampleQuestions.slice(0, 2).map((question) => (
                <button
                  key={question}
                  type="button"
                  disabled
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-400"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <aside className="space-y-6">
        <PaymentUnlockCard
          agent={agent}
          onUnlocked={async () => {
            setIsUnlocked(true);
            setHireStatusError(null);
          }}
        />

        <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            Suggested prompts
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {agent.sampleQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={async () => {
                  if (!isUnlocked) {
                    return;
                  }
                  setPendingPrompt(question);
                  await handleSend(question);
                }}
                disabled={isLoading || !isUnlocked}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-left text-sm text-slate-200 transition hover:border-cyan-400/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {question}
              </button>
            ))}
          </div>
          {pendingPrompt ? (
            <p className="mt-3 text-xs text-slate-400">Sent prompt: {pendingPrompt}</p>
          ) : null}
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            Task brief
          </p>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            <p>{agent.service}</p>
            <p>{agent.systemPrompt}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            Task completion
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Save a task completion record to 0G after the job is done.
          </p>
          <button
            type="button"
            onClick={saveTaskProof}
            disabled={savingProof || !isUnlocked}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          >
            <CheckCircle2 className="h-4 w-4" />
            {savingProof ? "Saving proof..." : "Save task proof to 0G"}
          </button>
        </div>

        {taskProof ? (
        <ProofCard
          proofType="Task Proof Ready for 0G"
        proof={{
          rootHash: taskProof.proofRootHash,
          txHash: taskProof.paymentTxHash,
          storedAt: taskProof.completedAt,
          url: taskProof.url,
          mode: taskProof.mode,
        }}
          status="stored"
        />
        ) : null}

        {error ? (
          <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-5 text-sm text-rose-100">
            {error.message}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
