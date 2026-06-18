"use client";

import { useState, type ReactNode } from "react";
import { CheckCircle2, Sparkles, Wallet } from "lucide-react";
import { useAccount, useProvider } from "@starknet-react/core";
import type { Agent, AgentCategory } from "@/types/agent";
import { agentCategories } from "@/data/agents";
import { uploadAgentMetadataTo0G } from "@/lib/0g";
import ProofCard from "@/components/0g/proof-card";
import type { ZeroGProof } from "@/types/0g";
import {
  createAgentRecord,
  updateAgent0GProof,
  updateAgentRecord,
} from "@/lib/db/agents";
import WalletConnectButton from "@/components/wallet/wallet-connect-button";
import { DEFAULT_PAYMENT_TOKEN } from "@/lib/starknet-config";
import { isPaymentTokenConfigured } from "@/lib/contracts";
import { createTransactionRecord } from "@/lib/db/hires";
import {
  buildPaymentCall,
  getPaymentReceiverAddress,
  isValidStarknetAddress,
  parseTokenAmount,
  shortenAddress,
  waitForStarknetTransaction,
} from "@/lib/starknet-payments";
import { getPaymentTokenBalance } from "@/lib/starknet-token";

const defaultState = {
  name: "",
  category: "Business" as AgentCategory,
  service: "",
  price: "12",
  currency: "STRK" as "STRK" | "ETH",
  description: "",
  prompt: "",
};

export default function CreateAgentForm({ initialAgent }: { initialAgent?: Agent | null }) {
  const [form, setForm] = useState(() => initialFormState(initialAgent));
  const [generatingProfile, setGeneratingProfile] = useState(false);
  const [publishingDraft, setPublishingDraft] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "paying" | "verifying" | "verified" | "failed"
  >("idle");
  const [paymentTxHash, setPaymentTxHash] = useState<string | null>(null);
  const [publishedProof, setPublishedProof] = useState<ZeroGProof | null>(null);
  const [publishedAgentId, setPublishedAgentId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { account, address, isConnected } = useAccount();
  const provider = useProvider();

  const isEditing = Boolean(initialAgent);
  const agentSlug = slugify(form.name || "draft-agent");
  const creationFee = Number(process.env.NEXT_PUBLIC_CREATE_AGENT_FEE?.trim() || "0");
  const creationFeeTokenSymbol =
    process.env.NEXT_PUBLIC_CREATE_AGENT_FEE_TOKEN_SYMBOL?.trim() || "STRK";
  const paymentRequired = creationFee > 0;
  const receiverAddress = getPaymentReceiverAddress();
  const receiverAddressValid = isValidStarknetAddress(receiverAddress);
  const feeTokenSymbol = creationFeeTokenSymbol;
  const feeAmount = Number.isFinite(creationFee) && creationFee > 0 ? creationFee : 0;
  const paymentVerified = paymentStatus === "verified";

  async function generateProfile() {
    setGeneratingProfile(true);
    setError(null);

    try {
      const response = await fetch("/api/agents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as {
        agent?: Partial<typeof form> & {
          systemPrompt?: string;
          currency?: "STRK" | "ETH";
          price?: number;
        };
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to generate agent draft.");
      }

      if (payload.agent) {
        setForm((current) => ({
          ...current,
          name: payload.agent?.name ?? current.name,
          category: (payload.agent?.category as AgentCategory) ?? current.category,
          service: payload.agent?.service ?? current.service,
          description: payload.agent?.description ?? current.description,
          prompt: payload.agent?.systemPrompt ?? current.prompt,
          currency: payload.agent?.currency ?? current.currency,
          price: String(payload.agent?.price ?? current.price),
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate agent draft.");
    } finally {
      setGeneratingProfile(false);
    }
  }

  async function verifyAndPayCreationFee() {
    if (!paymentRequired) {
      setPaymentStatus("verified");
      return null;
    }

    if (paymentVerified && paymentTxHash) {
      return paymentTxHash;
    }

    if (!isConnected || !account || !address) {
      throw new Error("Connect your Starknet wallet before paying the publish fee.");
    }

    if (!isPaymentTokenConfigured()) {
      throw new Error("Payment token address is not configured.");
    }

    if (!receiverAddressValid || !receiverAddress) {
      throw new Error("Creator payment receiver is not configured.");
    }

    setPaymentStatus("paying");

    const feeAmountBaseUnits = parseTokenAmount(feeAmount, DEFAULT_PAYMENT_TOKEN.decimals);

    try {
      const balance = await getPaymentTokenBalance(provider.provider, address, DEFAULT_PAYMENT_TOKEN.address);

      if (balance < feeAmountBaseUnits) {
        throw new Error(
          `Insufficient ${feeTokenSymbol} balance for the publish fee. Need ${feeAmount} ${feeTokenSymbol}.`,
        );
      }

      const loadingMessage = `Sending ${feeAmount} ${feeTokenSymbol} publish fee...`;
      setSuccess(loadingMessage);

      const tx = await account.execute([
        buildPaymentCall(
          DEFAULT_PAYMENT_TOKEN.address,
          receiverAddress,
          feeAmount,
          DEFAULT_PAYMENT_TOKEN.decimals,
        ),
      ]);

      setPaymentTxHash(tx.transaction_hash);
      setPaymentStatus("verifying");
      setSuccess(`Publish fee submitted. Verifying payment on Starknet...`);

      const status = await waitForStarknetTransaction(provider.provider, tx.transaction_hash);

      if (status !== "accepted") {
        throw new Error(
          status === "rejected"
            ? "Publish fee transaction was rejected."
            : "Publish fee confirmation timed out on Starknet.",
        );
      }

      await createTransactionRecord({
        id: `create-agent-fee-${tx.transaction_hash}`,
        agentId: initialAgent?.id ?? agentSlug,
        agentName: form.name || "New Agent",
        buyerWallet: address,
        creatorWallet: receiverAddress,
        amount: feeAmount,
        currency: feeTokenSymbol,
        txHash: tx.transaction_hash,
        status: "successful",
        network: "starknet-sepolia",
        source: "Create agent fee",
        createdAt: new Date().toISOString(),
      });

      setPaymentStatus("verified");
      return tx.transaction_hash;
    } catch (err) {
      setPaymentStatus("failed");
      throw err;
    }
  }

  async function publishDraft() {
    if (!isConnected || !address) {
      setError("Connect a Starknet wallet before publishing an agent.");
      return;
    }

    setPublishingDraft(true);
    setError(null);
    setSuccess(null);

    const now = new Date().toISOString();
    try {
      const feeTxHash = await verifyAndPayCreationFee();
      if (feeTxHash && !paymentTxHash) {
        setPaymentTxHash(feeTxHash);
      }

      const createdAgent = {
        id: initialAgent?.id ?? agentSlug,
        slug: initialAgent?.slug ?? agentSlug,
        name: form.name || "New Agent",
        category: form.category,
        description: form.description || "AI-generated agent draft.",
        service: form.service || "Agent service",
        price: Number(form.price || "0"),
        currency: form.currency,
        status: (initialAgent?.status === "unlisted" ? "unlisted" : "listed") as
          | "listed"
          | "unlisted",
        rating: initialAgent?.rating ?? 5,
        completedJobs: initialAgent?.completedJobs ?? 0,
        creator: initialAgent?.creator ?? "Creator",
        creatorWallet: address,
        systemPrompt:
          form.prompt ||
          "You are a focused BatAgents worker. Be practical, direct, and useful.",
        sampleQuestions:
          form.prompt.trim().length > 0
            ? [
                "What can you help with first?",
                "Can you give me a quick task plan?",
                "What should I ask next?",
              ]
            : [
                "What can you help with first?",
                "Can you give me a quick task plan?",
              ],
        createdAt: initialAgent?.createdAt ?? now,
        publishedAt: initialAgent?.publishedAt ?? now,
        zeroGProof: publishedProof ?? undefined,
      };

      const proof = await uploadAgentMetadataTo0G({
        agentId: createdAgent.id,
        agentName: createdAgent.name,
        creatorWallet: createdAgent.creatorWallet,
        category: createdAgent.category,
        service: createdAgent.service,
        description: createdAgent.description,
        systemPrompt: createdAgent.systemPrompt,
        sampleQuestions: createdAgent.sampleQuestions,
        publishedAt: now,
      });

      setPublishedProof(proof);

      if (isEditing) {
        await updateAgentRecord(createdAgent.id, {
          name: createdAgent.name,
          category: createdAgent.category,
          description: createdAgent.description,
          service: createdAgent.service,
          price: createdAgent.price,
          currency: createdAgent.currency,
          systemPrompt: createdAgent.systemPrompt,
          status: createdAgent.status,
        });
      } else {
        await createAgentRecord({
          ...createdAgent,
          zeroGProof: proof,
        });
      }

      await updateAgent0GProof(createdAgent.id, proof);
      setPublishedAgentId(createdAgent.id);
      const verifiedPaymentTxHash = feeTxHash ?? paymentTxHash;
      setSuccess(
        paymentRequired && verifiedPaymentTxHash
          ? "Payment verified and agent saved. Buyer feedback and chat history will refine future responses."
          : "Agent saved. Buyer feedback and chat history will refine future responses.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to publish agent.");
    } finally {
      setPublishingDraft(false);
    }
  }

  return (
    <form
      className="border border-white/10 bg-slate-950/60 p-6"
      onSubmit={(event) => {
        event.preventDefault();
        void publishDraft();
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Creator form</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            {isEditing ? "Edit agent" : "Create agent"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Keep the initial prompt concise. Creator instructions set the agent behavior, and buyer chats plus reviews add ongoing feedback context.
          </p>
        </div>
      </div>

      <div className="mt-6 border border-white/10 bg-slate-950/80 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Wallet state</p>
            <p className="mt-1 text-sm text-slate-300">
              {isConnected
                ? "Wallet connected. Your creator profile will be saved against this address."
                : "Connect your Starknet wallet before publishing an agent."}
            </p>
          </div>
          {isConnected ? (
            <div className="inline-flex items-center gap-2 border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-100">
              <Wallet className="h-4 w-4" />
              Connected
            </div>
          ) : null}
        </div>
        <div className="mt-4">
          <WalletConnectButton />
        </div>
      </div>

      {paymentRequired ? (
        <div className="mt-4 border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-50">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Publish fee</p>
              <p className="mt-1">
                Pay {feeAmount} {feeTokenSymbol} to{" "}
                <span className="font-mono text-white">{shortenAddress(receiverAddress)}</span>{" "}
                before publishing this agent.
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-2 text-xs font-medium text-slate-200">
              {paymentStatus === "verified"
                ? "Payment verified"
                : paymentStatus === "paying"
                  ? "Sending payment"
                  : paymentStatus === "verifying"
                    ? "Verifying transaction"
                    : "Payment required"}
            </div>
          </div>
          {paymentTxHash ? (
            <p className="mt-3 break-all font-mono text-xs text-cyan-100">
              Tx hash: {paymentTxHash}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4">
        <Field label="Agent name">
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Pitch Coach Agent"
            className="w-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
          />
        </Field>

        <Field label="Category">
          <select
            value={form.category}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                category: event.target.value as AgentCategory,
              }))
            }
            className="w-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
          >
            {agentCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Service">
          <input
            value={form.service}
            onChange={(event) => setForm((current) => ({ ...current, service: event.target.value }))}
            placeholder="Pitch review and startup storytelling"
            className="w-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price">
            <input
              type="number"
              min="1"
              value={form.price}
              onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
              className="w-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
            />
          </Field>
          <Field label="Currency">
            <select
              value={form.currency}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  currency: event.target.value as "STRK" | "ETH",
                }))
              }
              className="w-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
            >
              <option value="STRK">STRK</option>
              <option value="ETH">ETH</option>
            </select>
          </Field>
        </div>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            rows={4}
            placeholder="Describe exactly what this agent helps users accomplish."
            className="w-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
          />
        </Field>

        <Field label="Training prompt">
          <textarea
            value={form.prompt}
            onChange={(event) => setForm((current) => ({ ...current, prompt: event.target.value }))}
            rows={5}
            placeholder="Define the agent's working style, guardrails, and tone."
            className="w-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
          />
          <p className="text-xs leading-5 text-slate-500">
            Creator instructions shape the first version. Buyer conversations and ratings are kept as feedback for future updates.
          </p>
        </Field>
      </div>

      {paymentRequired ? (
        <div className="mt-6 border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-300">Payment summary</p>
              <p className="mt-1">
                Publish fee: <span className="font-semibold text-white">{feeAmount} {feeTokenSymbol}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Receiver</p>
              <p className="mt-1 font-mono text-xs text-cyan-100">
                {shortenAddress(receiverAddress)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-400">
            The publish fee is sent from your connected Starknet wallet and verified onchain before the agent is saved.
          </p>
        </div>
      ) : null}

      {success ? (
        <div className="mt-6 border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
          {success}
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={generateProfile}
          disabled={generatingProfile}
          className="inline-flex items-center justify-center gap-2 border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
        >
          <Sparkles className="h-4 w-4" />
          {generatingProfile ? "Generating..." : "Generate with AI"}
        </button>
        <button
          type="submit"
          disabled={publishingDraft || !isConnected || (paymentRequired && paymentStatus === "paying")}
          className="inline-flex items-center justify-center gap-2 bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
        >
          <CheckCircle2 className="h-4 w-4" />
          {!isConnected
            ? "Connect wallet to publish"
            : publishingDraft
              ? paymentRequired && paymentStatus !== "verified"
                ? "Paying..."
                : "Saving..."
              : isEditing
                ? paymentRequired && paymentStatus !== "verified"
                  ? "Pay & save changes"
                  : "Save changes"
                : paymentRequired && paymentStatus !== "verified"
                  ? "Pay & publish"
                  : "Publish agent"}
        </button>
      </div>

      {publishedProof ? (
        <div className="mt-6">
          <ProofCard proofType="Agent metadata proof" proof={publishedProof} status="stored" />
        </div>
      ) : null}

      {publishedAgentId ? (
        <div className="mt-6 border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
          Agent saved as <span className="font-mono text-white">{publishedAgentId}</span>.
          Use the creator dashboard to continue with onchain registration and performance tracking.
        </div>
      ) : null}
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-200">
      <span>{label}</span>
      {children}
    </label>
  );
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function initialFormState(initialAgent?: Agent | null) {
  if (!initialAgent) {
    return defaultState;
  }

  return {
    name: initialAgent.name,
    category: initialAgent.category,
    service: initialAgent.service,
    price: String(initialAgent.price),
    currency: initialAgent.currency,
    description: initialAgent.description,
    prompt: initialAgent.systemPrompt,
  };
}
