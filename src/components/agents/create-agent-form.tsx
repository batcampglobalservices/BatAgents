"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, Sparkles, Wallet } from "lucide-react";
import { useAccount, useProvider } from "@starknet-react/core";
import type { Agent, AgentCategory } from "@/types/agent";
import { agentCategories } from "@/data/agents";
import { uploadAgentMetadataTo0G } from "@/lib/0g";
import ProofCard from "@/components/0g/proof-card";
import type { ZeroGProof } from "@/types/0g";
import {
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
import {
  getStoredCreatedAgents,
  saveCreatedAgent,
  type CreatedAgentRecord,
} from "@/lib/created-agents";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

const defaultState = {
  name: "",
  category: "Business" as AgentCategory,
  service: "",
  price: "12",
  currency: "STRK" as "STRK" | "ETH",
  description: "",
  prompt: "",
};

type CreateAgentFormProps = {
  initialAgent?: Agent | null;
  editSlug?: string;
};

export default function CreateAgentForm({ initialAgent, editSlug }: CreateAgentFormProps) {
  const [resolvedAgent, setResolvedAgent] = useState<Agent | null>(initialAgent ?? null);
  const [form, setForm] = useState(() => initialFormState(initialAgent));
  const [generatingProfile, setGeneratingProfile] = useState(false);
  const [publishingDraft, setPublishingDraft] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "paying" | "verifying" | "verified" | "failed"
  >("idle");
  const [paymentTxHash, setPaymentTxHash] = useState<string | null>(null);
  const [publishedProof, setPublishedProof] = useState<ZeroGProof | null>(null);
  const [publishedAgentId, setPublishedAgentId] = useState<string | null>(null);
  const [balancePreview, setBalancePreview] = useState<{
    status: "idle" | "loading" | "ready" | "error";
    value?: string;
    error?: string;
  }>({ status: "idle" });
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { account, address, isConnected } = useAccount();
  const provider = useProvider();

  const isEditing = Boolean(resolvedAgent || editSlug);
  const agentSlug = slugify(form.name || "draft-agent");
  const creationFee = Number(process.env.NEXT_PUBLIC_CREATE_AGENT_FEE?.trim() || "0");
  const creationFeeTokenSymbol =
    process.env.NEXT_PUBLIC_CREATE_AGENT_FEE_TOKEN_SYMBOL?.trim() || "STRK";
  const paymentRequired = creationFee > 0;
  const receiverAddress = getPaymentReceiverAddress();
  const receiverAddressValid = isValidStarknetAddress(receiverAddress);
  const feeTokenSymbol = creationFeeTokenSymbol;
  const feeAmount = Number.isFinite(creationFee) && creationFee > 0 ? creationFee : 0;
  const feeAmountBaseUnits = useMemo(
    () => parseTokenAmount(feeAmount, DEFAULT_PAYMENT_TOKEN.decimals),
    [feeAmount],
  );
  const paymentVerified = paymentStatus === "verified";

  useEffect(() => {
    if (initialAgent) {
      setResolvedAgent(initialAgent);
      setForm(initialFormState(initialAgent));
      return;
    }

    if (!editSlug) {
      setResolvedAgent(null);
      setForm(initialFormState(null));
      return;
    }

    const localAgent = getStoredCreatedAgents().find(
      (agent) => agent.slug === editSlug || agent.id === editSlug,
    );

    if (localAgent) {
      setResolvedAgent(localAgent);
      setForm(initialFormState(localAgent));
    }
  }, [editSlug, initialAgent]);

  useEffect(() => {
    let cancelled = false;

    async function loadBalancePreview() {
      if (!paymentRequired || !isConnected || !address) {
        setBalancePreview({ status: "idle" });
        return;
      }

      try {
        setBalancePreview({ status: "loading" });
        const balance = await getPaymentTokenBalance(
          provider.provider,
          address,
          DEFAULT_PAYMENT_TOKEN.address,
        );

        if (cancelled) {
          return;
        }

        setBalancePreview({
          status: "ready",
          value: `${formatTokenAmount(balance, DEFAULT_PAYMENT_TOKEN.decimals)} ${DEFAULT_PAYMENT_TOKEN.symbol}`,
        });
      } catch (balanceError) {
        if (cancelled) {
          return;
        }

        setBalancePreview({
          status: "error",
          error:
            balanceError instanceof Error
              ? balanceError.message
              : "Unable to load balance preview.",
        });
      }
    }

    void loadBalancePreview();

    return () => {
      cancelled = true;
    };
  }, [
    address,
    isConnected,
    paymentRequired,
    provider.provider,
  ]);

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
        agentId: resolvedAgent?.id ?? agentSlug,
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

      const client = getSupabaseBrowserClient();

      if (!client) {
        throw new Error(
          isSupabaseConfigured()
            ? "Supabase browser client is not available in this environment."
            : "Supabase is not configured.",
        );
      }

      const authResult = await client.auth.getUser();
      const userId = authResult.data.user?.id ?? null;
      const userError = authResult.error;

      console.log("CREATE_AGENT_SUPABASE_USER_ID", userId);

      if (userError) {
        console.error("CREATE_AGENT_SUPABASE_ERROR", userError);
        throw new Error(userError.message);
      }

      if (!userId) {
        throw new Error("Sign in to Supabase before creating an agent.");
      }

      const slug = isEditing && resolvedAgent?.slug
        ? resolvedAgent.slug
        : await generateUniqueAgentSlug(
            client,
            slugify(form.name || "draft-agent"),
            null,
          );
      console.log("CREATE_AGENT_GENERATED_SLUG", slug);

      const payload = {
        creator_id: userId,
        creator_wallet: address,
        name: form.name || "New Agent",
        slug,
        category: form.category,
        description: form.description || "AI-generated agent draft.",
        service: form.service || "Agent service",
        price: Number(form.price || "0"),
        currency: form.currency,
        system_prompt:
          form.prompt ||
          "You are a focused BatAgents worker. Be practical, direct, and useful.",
        training_data: form.prompt || null,
        status: (resolvedAgent?.status ?? "draft") as Agent["status"],
        is_listed: resolvedAgent?.isListed ?? (resolvedAgent?.status === "listed" || resolvedAgent?.status === "published"),
        is_minted: resolvedAgent?.isMinted ?? Boolean(resolvedAgent?.onchainRegistrationTxHash),
        nft_token_id: resolvedAgent?.nftTokenId ?? null,
        contract_address: resolvedAgent?.contractAddress ?? null,
        transaction_hash: resolvedAgent?.transactionHash ?? null,
        zero_g_root_hash: resolvedAgent?.zeroGProof?.rootHash ?? null,
        zero_g_tx_hash: resolvedAgent?.zeroGProof?.txHash ?? null,
        zero_g_url: resolvedAgent?.zeroGProof?.url ?? null,
        zero_g_mode: resolvedAgent?.zeroGProof?.mode ?? "demo",
        zero_g_status: resolvedAgent?.zeroGProof ? "stored" : "pending",
        zero_g_stored_at: resolvedAgent?.zeroGProof?.storedAt ?? null,
        onchain_agent_id: resolvedAgent?.onchainAgentId ?? null,
        onchain_registration_tx_hash: resolvedAgent?.onchainRegistrationTxHash ?? null,
        onchain_registered: Boolean(
          resolvedAgent?.onchainRegistrationTxHash || resolvedAgent?.isMinted,
        ),
        updated_at: now,
      };

      console.log("CREATE_AGENT_SUPABASE_PAYLOAD", payload);

      let savedAgent: Agent;

      if (isEditing && resolvedAgent?.id) {
        const { data: updatedAgent, error: updateError } = await client
          .from("agents")
          .update({
            ...payload,
          })
          .eq("id", resolvedAgent.id)
          .eq("creator_id", userId)
          .select("*")
          .single();

        console.log("CREATE_AGENT_SUPABASE_RESULT", updatedAgent);
        console.log("CREATE_AGENT_SUPABASE_ERROR", updateError);

        if (updateError) {
          throw new Error(updateError.message);
        }

        if (!updatedAgent) {
          throw new Error("Supabase did not return the updated agent.");
        }

        savedAgent = {
          id: updatedAgent.id,
          slug: updatedAgent.slug,
          name: updatedAgent.name,
          category: (updatedAgent.category as AgentCategory) ?? form.category,
          description: updatedAgent.description ?? form.description,
          service: updatedAgent.service ?? form.service,
          price: Number(updatedAgent.price ?? form.price ?? "0"),
          currency: updatedAgent.currency === "ETH" ? "ETH" : "STRK",
          rating: resolvedAgent.rating,
          completedJobs: resolvedAgent.completedJobs,
          creator: resolvedAgent.creator,
          creatorWallet: address,
          systemPrompt: updatedAgent.system_prompt ?? form.prompt,
          trainingData: updatedAgent.training_data ?? form.prompt,
          sampleQuestions: resolvedAgent.sampleQuestions,
          createdAt: updatedAgent.created_at ?? now,
          status:
            updatedAgent.status === "listed" ||
            updatedAgent.status === "published" ||
            updatedAgent.status === "draft"
              ? updatedAgent.status
              : "draft",
          isListed: Boolean(updatedAgent.is_listed),
          isMinted: Boolean(updatedAgent.is_minted),
          nftTokenId: updatedAgent.nft_token_id ?? undefined,
          contractAddress: updatedAgent.contract_address ?? undefined,
          transactionHash: updatedAgent.transaction_hash ?? undefined,
          zeroGProof: undefined,
          onchainAgentId: updatedAgent.onchain_agent_id ?? undefined,
          onchainRegistrationTxHash:
            updatedAgent.onchain_registration_tx_hash ?? undefined,
          publishedAt: now,
        };
      } else {
        const insertResult = await insertAgentWithUniqueSlugRetry(
          client,
          payload,
          slug,
        );

        const { data: insertedAgent, error: insertError } = insertResult;

        console.log("CREATE_AGENT_SUPABASE_RESULT", insertedAgent);
        console.log("CREATE_AGENT_SUPABASE_ERROR", insertError);

        if (insertError) {
          throw new Error(insertError.message);
        }

        if (!insertedAgent) {
          throw new Error("Supabase did not return the inserted agent.");
        }

        savedAgent = {
          id: insertedAgent.id,
          slug: insertedAgent.slug,
          name: insertedAgent.name,
          category: (insertedAgent.category as AgentCategory) ?? form.category,
          description: insertedAgent.description ?? form.description,
          service: insertedAgent.service ?? form.service,
          price: Number(insertedAgent.price ?? form.price ?? "0"),
          currency: insertedAgent.currency === "ETH" ? "ETH" : "STRK",
          rating: resolvedAgent?.rating ?? 5,
          completedJobs: resolvedAgent?.completedJobs ?? 0,
          creator: resolvedAgent?.creator ?? "Creator",
          creatorWallet: address,
          systemPrompt:
            insertedAgent.system_prompt ||
            form.prompt ||
            "You are a focused BatAgents worker. Be practical, direct, and useful.",
          trainingData: insertedAgent.training_data ?? form.prompt,
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
          createdAt: insertedAgent.created_at ?? now,
          publishedAt: now,
          status:
            insertedAgent.status === "listed" ||
            insertedAgent.status === "published" ||
            insertedAgent.status === "draft"
              ? insertedAgent.status
              : "draft",
          isListed: Boolean(insertedAgent.is_listed),
          isMinted: Boolean(insertedAgent.is_minted),
          contractAddress: insertedAgent.contract_address ?? undefined,
          nftTokenId: insertedAgent.nft_token_id ?? undefined,
          transactionHash: insertedAgent.transaction_hash ?? undefined,
          zeroGProof: undefined,
          onchainAgentId: insertedAgent.onchain_agent_id ?? undefined,
          onchainRegistrationTxHash:
            insertedAgent.onchain_registration_tx_hash ?? undefined,
        };
      }

      console.log("CREATE_AGENT_CREATED_AGENT_ID", savedAgent.id);

      const proof = await uploadAgentMetadataTo0G({
        agentId: savedAgent.id,
        agentName: savedAgent.name,
        creatorWallet: savedAgent.creatorWallet,
        category: savedAgent.category,
        service: savedAgent.service,
        description: savedAgent.description,
        systemPrompt: savedAgent.systemPrompt,
        sampleQuestions: savedAgent.sampleQuestions,
        publishedAt: now,
      });

      setPublishedProof(proof);

      if (isEditing && resolvedAgent?.id) {
        await updateAgentRecord(savedAgent.id, {
          name: savedAgent.name,
          category: savedAgent.category,
          description: savedAgent.description,
          service: savedAgent.service,
          price: savedAgent.price,
          currency: savedAgent.currency,
          systemPrompt: savedAgent.systemPrompt,
          trainingData: savedAgent.trainingData,
          status: savedAgent.status,
        });
      } else {
        saveCreatedAgent({
          ...savedAgent,
          zeroGProof: proof,
          publishedAt: now,
        } as CreatedAgentRecord);
      }

      await updateAgent0GProof(savedAgent.id, proof);

      setPublishedAgentId(savedAgent.id);
      const verifiedPaymentTxHash = feeTxHash ?? paymentTxHash;
      setSuccess(
        paymentRequired && verifiedPaymentTxHash
          ? "Payment verified and agent draft saved to Supabase. List it from the creator dashboard when ready."
          : "Agent draft saved to Supabase. List it from the creator dashboard when ready.",
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

      {paymentRequired ? (
        <div className="mt-4 border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-200">
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
            Publish debug
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <DebugRow label="Connected wallet" value={address ?? "Not connected"} mono />
            <DebugRow
              label="Token contract"
              value={DEFAULT_PAYMENT_TOKEN.address}
              mono
            />
            <DebugRow
              label="Fee units"
              value={feeAmountBaseUnits.toString()}
              mono
            />
            <DebugRow
              label="Balance check"
              value={
                balancePreview.status === "ready"
                  ? balancePreview.value || "Available"
                  : balancePreview.status === "loading"
                    ? "Loading..."
                    : balancePreview.status === "error"
                      ? balancePreview.error || "Unavailable"
                      : "Connect wallet to check"
              }
            />
          </div>
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

function DebugRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">{label}</p>
      <p className={`mt-2 text-sm text-white ${mono ? "font-mono break-all text-xs" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueAgentSlug(
  client: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>,
  baseSlug: string,
  excludeAgentId: string | null,
) {
  const normalizedBase = slugify(baseSlug || "draft-agent");
  const isAvailable = async (candidate: string) => {
    const { data, error } = await client
      .from("agents")
      .select("id, slug")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return true;
    }

    return excludeAgentId ? data.id === excludeAgentId : false;
  };

  if (await isAvailable(normalizedBase)) {
    return normalizedBase;
  }

  for (let suffix = 2; suffix <= 12; suffix += 1) {
    const candidate = `${normalizedBase}-${suffix}`;
    if (await isAvailable(candidate)) {
      return candidate;
    }
  }

  const randomSuffix = Math.random().toString(36).slice(2, 6);
  const fallback = `${normalizedBase}-${randomSuffix}`;
  if (await isAvailable(fallback)) {
    return fallback;
  }

  return `${normalizedBase}-${Date.now().toString(36).slice(-4)}`;
}

async function insertAgentWithUniqueSlugRetry(
  client: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>,
  payload: { name: string } & Record<string, unknown>,
  baseSlug: string,
) {
  const attemptInsert = async (candidateSlug: string) =>
    client.from("agents").insert({ ...payload, slug: candidateSlug }).select("*").single();

  let currentSlug = baseSlug;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const result = await attemptInsert(currentSlug);

    if (!result.error) {
      return result;
    }

    const message = result.error.message.toLowerCase();
    const isDuplicateSlug =
      message.includes("agents_slug_key") ||
      message.includes("duplicate key value") ||
      message.includes("duplicate");

    if (!isDuplicateSlug) {
      return result;
    }

    currentSlug = await generateUniqueAgentSlug(
      client,
      `${baseSlug}-${attempt + 2}`,
      null,
    );
  }

  return attemptInsert(`${baseSlug}-${Math.random().toString(36).slice(2, 6)}`);
}

function formatTokenAmount(raw: bigint, decimals: number) {
  const negative = raw < BigInt(0);
  const absolute = negative ? -raw : raw;
  const base = BigInt(10) ** BigInt(decimals);
  const whole = absolute / base;
  const fraction = absolute % base;

  if (fraction === BigInt(0)) {
    return `${negative ? "-" : ""}${whole.toString()}`;
  }

  const fractionText = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
  return `${negative ? "-" : ""}${whole.toString()}.${fractionText}`;
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
