import { agents as staticAgents } from "@/data/agents";
import type { Agent } from "@/types/agent";
import type { ZeroGProof } from "@/types/0g";
import {
  getStoredCreatedAgents,
  saveCreatedAgent,
  updateCreatedAgent as updateStoredCreatedAgent,
  type CreatedAgentRecord,
} from "@/lib/created-agents";
import { agentIdToFelt } from "@/lib/agent-id";
import {
  getSupabaseAdminClient,
} from "@/lib/supabase/admin";
import {
  getSupabaseBrowserClient,
} from "@/lib/supabase/client";

async function getSupabaseClient() {
  const { getSupabaseServerClient } = await import("@/lib/supabase/server");

  return (
    getSupabaseBrowserClient() ??
    (await getSupabaseServerClient()) ??
    getSupabaseAdminClient()
  );
}

function rowToAgent(row: {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  description: string | null;
  service: string | null;
  system_prompt: string | null;
  price: number | null;
  currency: string;
  creator_wallet: string | null;
  zero_g_root_hash: string | null;
  zero_g_tx_hash: string | null;
  zero_g_url: string | null;
  zero_g_mode: string | null;
  zero_g_status: string | null;
  zero_g_stored_at: string | null;
  onchain_registration_tx_hash: string | null;
  onchain_agent_id: string | null;
  created_at?: string;
  updated_at?: string;
}): Agent {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: (row.category as Agent["category"]) ?? "Business",
    description: row.description ?? "",
    service: row.service ?? "",
    price: Number(row.price ?? 0),
    currency: row.currency === "ETH" ? "ETH" : "STRK",
    rating: 5,
    completedJobs: 0,
    creator: row.creator_wallet ? "Supabase Creator" : "Batcamp Studio",
    creatorWallet: row.creator_wallet ?? "",
    systemPrompt: row.system_prompt ?? "",
    sampleQuestions: [],
    createdAt: row.created_at ?? new Date().toISOString(),
    zeroGProof: row.zero_g_root_hash
      ? {
          rootHash: row.zero_g_root_hash,
          txHash: row.zero_g_tx_hash ?? undefined,
          url: row.zero_g_url ?? undefined,
          storedAt: row.zero_g_stored_at ?? row.created_at ?? new Date().toISOString(),
          mode: (row.zero_g_mode as ZeroGProof["mode"]) ?? "demo",
        }
      : undefined,
    onchainAgentId: row.onchain_agent_id ?? undefined,
    onchainRegistrationTxHash: row.onchain_registration_tx_hash ?? undefined,
  };
}

function mergeUniqueAgents(agents: Agent[]) {
  const bySlug = new Map<string, Agent>();

  for (const agent of staticAgents) {
    bySlug.set(agent.slug, agent);
  }

  for (const agent of agents) {
    bySlug.set(agent.slug, agent);
  }

  for (const agent of getStoredCreatedAgents()) {
    bySlug.set(agent.slug, agent);
  }

  return Array.from(bySlug.values());
}

export async function getAgents() {
  const client = await getSupabaseClient();

  if (!client) {
    return mergeUniqueAgents([]);
  }

  const { data } = await client.from("agents").select("*").order("created_at", {
    ascending: false,
  });

  return mergeUniqueAgents((data ?? []).map(rowToAgent));
}

export async function getAgentBySlug(slug: string) {
  const normalized = slug.trim().toLowerCase();
  const publishedAgents = await getAgents();
  return publishedAgents.find((agent) => agent.slug === normalized || agent.id === normalized);
}

export async function createAgentRecord(agent: CreatedAgentRecord) {
  const client = await getSupabaseClient();

  if (client) {
    await client.from("agents").upsert({
      id: agent.id,
      slug: agent.slug,
      name: agent.name,
      category: agent.category,
      description: agent.description,
      service: agent.service,
      system_prompt: agent.systemPrompt,
      price: agent.price,
      currency: agent.currency,
      creator_wallet: agent.creatorWallet,
      status: "published",
      zero_g_root_hash: agent.zeroGProof?.rootHash ?? null,
      zero_g_tx_hash: agent.zeroGProof?.txHash ?? null,
      zero_g_url: agent.zeroGProof?.url ?? null,
      zero_g_mode: agent.zeroGProof?.mode ?? "demo",
      zero_g_status: agent.zeroGProof ? "stored" : "pending",
      zero_g_stored_at: agent.zeroGProof?.storedAt ?? null,
      onchain_registration_tx_hash: agent.onchainRegistrationTxHash ?? null,
      onchain_agent_id: agent.onchainAgentId ?? null,
      onchain_registered: Boolean(agent.onchainRegistrationTxHash),
      updated_at: new Date().toISOString(),
    });
  }

  saveCreatedAgent(agent);
  return agent;
}

export async function createAgent(agent: CreatedAgentRecord) {
  return createAgentRecord(agent);
}

export async function updateAgent0GProof(agentId: string, proof: ZeroGProof) {
  const client = await getSupabaseClient();

  if (client) {
    await client
      .from("agents")
      .update({
        zero_g_root_hash: proof.rootHash,
        zero_g_tx_hash: proof.txHash ?? null,
        zero_g_url: proof.url ?? null,
        zero_g_mode: proof.mode ?? "demo",
        zero_g_status: "stored",
        zero_g_stored_at: proof.storedAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", agentId);
  }

  updateStoredCreatedAgent(agentId, (agent) => ({
    ...agent,
    zeroGProof: proof,
  }));
}

export async function updateAgentOnchainRegistration(
  agentId: string,
  txHash: string,
) {
  const client = await getSupabaseClient();

  if (client) {
    await client
      .from("agents")
      .update({
        onchain_agent_id: agentIdToFelt(agentId),
        onchain_registration_tx_hash: txHash,
        onchain_registered: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", agentId);
  }

  updateStoredCreatedAgent(agentId, (agent) => ({
    ...agent,
    onchainAgentId: agent.onchainAgentId ?? agentIdToFelt(agentId),
    onchainRegistrationTxHash: txHash,
  }));
}
