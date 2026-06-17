"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import type { AgentCategory } from "@/types/agent";
import { agentCategories } from "@/data/agents";
import { useAccount, useProvider } from "@starknet-react/core";
import { isContractConfigured } from "@/lib/contracts";
import { registerAgentOnchain } from "@/lib/starknet-contract";
import { waitForStarknetTransaction } from "@/lib/starknet-payments";
import ProofCard from "@/components/0g/proof-card";
import type { ZeroGProof } from "@/types/0g";
import PageHeader from "@/components/ui/page-header";
import StatusBadge from "@/components/ui/status-badge";
import {
  createAgentRecord,
  updateAgent0GProof,
  updateAgentOnchainRegistration,
} from "@/lib/db/agents";

const initialState = {
  name: "",
  category: "Business" as AgentCategory,
  service: "",
  price: "12",
  currency: "STRK" as "STRK" | "ETH",
  description: "",
  prompt: "",
};

export default function CreateAgentForm() {
  const [form, setForm] = useState(initialState);
  const [submitted, setSubmitted] = useState(false);
  const [generatingProfile, setGeneratingProfile] = useState(false);
  const [registrationState, setRegistrationState] = useState<
    "idle" | "connecting" | "submitting" | "waiting" | "success" | "failed"
  >("idle");
  const [registrationTxHash, setRegistrationTxHash] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [publishedProof, setPublishedProof] = useState<ZeroGProof | null>(null);
  const [publishedAgentId, setPublishedAgentId] = useState<string | null>(null);
  const { account, address, isConnected } = useAccount();
  const provider = useProvider();

  const agentSlug = slugify(form.name || "draft-agent");
  const creatorLabel = "Creator";

  async function generateProfile() {
    setGeneratingProfile(true);

    try {
      const response = await fetch("/api/agents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as {
        agent?: Partial<typeof form> & {
          sampleQuestions?: string[];
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
    } catch (error) {
      setRegistrationError(
        error instanceof Error ? error.message : "Unable to generate agent draft.",
      );
    } finally {
      setGeneratingProfile(false);
    }
  }

  async function publishDraft() {
    if (!isConnected || !address) {
      setRegistrationError("Connect a Starknet wallet before publishing an agent.");
      return;
    }

    const now = new Date().toISOString();
    const createdAgent = {
      id: agentSlug,
      slug: agentSlug,
      name: form.name || "New Agent",
      category: form.category,
      description: form.description || "AI-generated agent draft.",
      service: form.service || "Agent service",
      price: Number(form.price || "0"),
      currency: form.currency,
      rating: 5,
      completedJobs: 0,
      creator: creatorLabel,
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
      createdAt: now,
      publishedAt: now,
      zeroGProof: publishedProof ?? undefined,
    };

    setPublishedAgentId(createdAgent.id);

    try {
      const response = await fetch("/api/0g/upload-agent-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: createdAgent.id,
          agentName: createdAgent.name,
          creatorWallet: createdAgent.creatorWallet,
          category: createdAgent.category,
          service: createdAgent.service,
          description: createdAgent.description,
          systemPrompt: createdAgent.systemPrompt,
          sampleQuestions: createdAgent.sampleQuestions,
          publishedAt: now,
        }),
      });

      const payload = (await response.json()) as {
        proof?: ZeroGProof;
        error?: string;
        message?: string;
      };

      if (!response.ok || !payload.proof) {
        throw new Error(payload.error || "Unable to create 0G proof.");
      }

      setPublishedProof(payload.proof);
      await createAgentRecord({
        ...createdAgent,
        zeroGProof: payload.proof,
      });
      await updateAgent0GProof(createdAgent.id, payload.proof);
    } catch (error) {
      setRegistrationError(
        error instanceof Error ? error.message : "Unable to publish agent.",
      );
      return;
    }

    setSubmitted(true);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form
        className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <PageHeader
            eyebrow="Creator workspace"
            title="Create an AI agent in four guided steps."
            description="Write the agent, let Groq draft the profile, store metadata on 0G, then register the agent on Starknet Sepolia."
          />
          <StatusBadge tone="cyan">Creator</StatusBadge>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {[
            "1. Agent basics",
            "2. AI instructions",
            "3. 0G metadata",
            "4. Onchain registration",
          ].map((step) => (
            <div key={step} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              {step}
            </div>
          ))}
        </div>

        {submitted ? (
          <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100">
            Agent created and 0G proof stored. Register this agent onchain to allow paid hiring.
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Agent name">
            <input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Pitch Coach Agent"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
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
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
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
              onChange={(event) =>
                setForm((current) => ({ ...current, service: event.target.value }))
              }
              placeholder="Pitch review and startup storytelling"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
            />
          </Field>
          <Field label="Price">
            <div className="flex gap-3">
              <input
                type="number"
                min="1"
                value={form.price}
                onChange={(event) =>
                  setForm((current) => ({ ...current, price: event.target.value }))
                }
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
              />
              <select
                value={form.currency}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    currency: event.target.value as "STRK" | "ETH",
                  }))
                }
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
              >
                <option value="STRK">STRK</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
          </Field>
        </div>

        <div className="mt-4 grid gap-4">
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              rows={4}
              placeholder="Describe exactly what this agent helps users accomplish."
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
            />
          </Field>
          <Field label="System prompt">
            <textarea
              value={form.prompt}
              onChange={(event) =>
                setForm((current) => ({ ...current, prompt: event.target.value }))
              }
              rows={5}
              placeholder="Define the agent's working style and guardrails."
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
            />
          </Field>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={generateProfile}
            disabled={generatingProfile}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
          >
            <Sparkles className="h-4 w-4" />
            {generatingProfile ? "Generating..." : "Generate with AI"}
          </button>
          <button
            type="button"
            onClick={publishDraft}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            <CheckCircle2 className="h-4 w-4" />
            Publish agent
          </button>
        </div>

        {submitted ? (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
              Onchain registration
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Register this agent on Starknet Sepolia so buyers can hire it through the BatAgents Cairo contract.
            </p>

            {!isContractConfigured() ? (
              <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                BatAgents contract address is not configured. Add
                NEXT_PUBLIC_BATAGENTS_CONTRACT_ADDRESS after deployment.
              </div>
            ) : null}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                  Agent slug
                </p>
                <p className="mt-2 font-mono text-xs text-white">{agentSlug}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                  Wallet
                </p>
                <p className="mt-2 font-mono text-xs text-white">
                  {address ?? "Not connected"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                if (!isConnected || !account) {
                  setRegistrationError("Connect a Starknet wallet first.");
                  return;
                }

                if (!isContractConfigured()) {
                  setRegistrationError(
                    "BatAgents contract address is not configured. Add NEXT_PUBLIC_BATAGENTS_CONTRACT_ADDRESS after deployment.",
                  );
                  return;
                }

                setRegistrationError(null);
                setRegistrationState("submitting");

                try {
                  const txHash = await registerAgentOnchain({
                    account,
                    agentSlug,
                    price: Number(form.price),
                  });

                  setRegistrationTxHash(txHash);
                  setRegistrationState("waiting");
                  const status = await waitForStarknetTransaction(
                    account ?? provider.provider,
                    txHash,
                  );

                  if (status !== "accepted") {
                    throw new Error(
                      status === "rejected"
                        ? "Registration transaction was rejected."
                        : "Registration confirmation timed out on Starknet Sepolia.",
                    );
                  }

                  setRegistrationState("success");
                  await updateAgentOnchainRegistration(agentSlug, txHash);
                } catch (error) {
                  setRegistrationState("failed");
                  setRegistrationError(
                    error instanceof Error ? error.message : "Registration failed.",
                  );
                }
              }}
              disabled={registrationState === "submitting" || registrationState === "waiting"}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
            >
              <CheckCircle2 className="h-4 w-4" />
              {registrationState === "submitting"
                ? "Registering..."
                : registrationState === "waiting"
                  ? "Waiting for confirmation..."
                  : registrationState === "success"
                    ? "Agent registered onchain"
                    : "Register Agent Onchain"}
            </button>

            {registrationTxHash ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                  Registration tx
                </p>
                <p className="mt-2 break-all font-mono text-xs text-white">
                  {registrationTxHash}
                </p>
              </div>
            ) : null}

            {registrationError ? (
              <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
                {registrationError}
              </div>
            ) : null}

            {publishedProof ? (
              <div className="mt-4">
                <ProofCard proofType="Agent metadata proof" proof={publishedProof} status="stored" />
              </div>
            ) : null}

            {publishedAgentId ? (
              <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                Agent saved to the app record as <span className="font-mono">{publishedAgentId}</span>.
                It now appears in the marketplace and is ready for Starknet registration.
              </div>
            ) : null}
          </div>
        ) : null}
      </form>

      <aside className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Live preview</p>
        <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            {form.category}
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            {form.name || "Your agent name"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {form.description || "The description will help buyers understand the task."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              {form.currency} {form.price}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              {form.service || "Service preview"}
            </span>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">What happens next</p>
          <ul className="mt-3 space-y-2 leading-6">
            <li>0G metadata keeps the profile verifiable outside the app database.</li>
            <li>Starknet registration lets buyers hire the agent on Sepolia.</li>
            <li>The marketplace updates once the record is saved.</li>
          </ul>
        </div>
      </aside>
    </div>
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
