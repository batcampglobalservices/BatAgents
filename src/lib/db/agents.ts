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
  try {
    const { getSupabaseServerClient } = await import("@/lib/supabase/server");

    return (
      getSupabaseBrowserClient() ??
      (await getSupabaseServerClient()) ??
      getSupabaseAdminClient()
    );
  } catch {
    return getSupabaseBrowserClient() ?? getSupabaseAdminClient();
  }
}

type AgentRow = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  description: string | null;
  service: string | null;
  system_prompt: string | null;
  training_data: string | null;
  price: number | null;
  currency: string;
  creator_wallet: string | null;
  status: string | null;
  is_listed: boolean | null;
  is_minted: boolean | null;
  nft_token_id: string | null;
  contract_address: string | null;
  transaction_hash: string | null;
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
};

function rowToAgent(row: AgentRow): Agent {
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
  creatorId: row.creator_id ?? undefined,
  systemPrompt: row.system_prompt ?? "",
    trainingData: row.training_data ?? undefined,
    sampleQuestions: [],
    createdAt: row.created_at ?? new Date().toISOString(),
    status:
      row.status === "draft" ||
      row.status === "unlisted" ||
      row.status === "listed" ||
      row.status === "published"
        ? row.status
        : "listed",
    isListed: Boolean(row.is_listed),
    isMinted: Boolean(row.is_minted),
    nftTokenId: row.nft_token_id ?? undefined,
    contractAddress: row.contract_address ?? undefined,
    transactionHash: row.transaction_hash ?? undefined,
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

async function fetchSupabaseAgents() {
  const client = await getSupabaseClient();

  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from("agents")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("SUPABASE_AGENTS_ERROR", error);
    return [];
  }

  return (data ?? []).map(rowToAgent);
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

function findLocalAgentBySlug(slug: string, options?: { includeUnlisted?: boolean }) {
  const normalized = slug.trim().toLowerCase();
  const match = mergeUniqueAgents([]).find(
    (agent) => agent.slug === normalized || agent.id === normalized,
  );

  if (!match) {
    return undefined;
  }

  if (options?.includeUnlisted) {
    return match;
  }

  return match.status === "unlisted" ? undefined : match;
}

export async function getAgents() {
  try {
    return mergeUniqueAgents(await fetchSupabaseAgents());
  } catch {
    return mergeUniqueAgents([]);
  }
}

export async function getAgentBySlug(
  slug: string,
  options?: { includeUnlisted?: boolean },
) {
  try {
    const normalized = slug.trim().toLowerCase();

    const client = await getSupabaseClient();

    if (!client) {
      return findLocalAgentBySlug(normalized, options);
    }

    const { data, error } = await client
      .from("agents")
      .select("*")
      .eq("slug", normalized)
      .maybeSingle();

    console.error("CHAT_AGENT_SLUG", normalized);
    console.error("CHAT_AGENT_DATA", data);
    console.error("CHAT_AGENT_ERROR", error);

    if (error) {
      console.error("SUPABASE_AGENT_ERROR", error);
      return undefined;
    }

    if (!data) {
      return findLocalAgentBySlug(normalized, options);
    }

    const agent = rowToAgent(data);

    if (options?.includeUnlisted) {
      return agent;
    }

    return agent.status === "unlisted" ? undefined : agent;
  } catch {
    console.error("AGENT_SLUG", slug);
    return findLocalAgentBySlug(slug, options);
  }
}

export async function getListedAgents() {
  const agents = await fetchSupabaseAgents();
  return agents.filter(
    (agent) =>
      agent.isListed ||
      agent.status === "listed" ||
      agent.status === "published",
  );
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
      training_data: agent.trainingData ?? null,
      price: agent.price,
      currency: agent.currency,
      creator_wallet: agent.creatorWallet,
      status: agent.status ?? "draft",
      is_listed: agent.isListed ?? (agent.status === "listed" || agent.status === "published"),
      is_minted: agent.isMinted ?? Boolean(agent.onchainRegistrationTxHash),
      nft_token_id: agent.nftTokenId ?? null,
      contract_address: agent.contractAddress ?? null,
      transaction_hash: agent.transactionHash ?? null,
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
  options?: {
    contractAddress?: string;
    nftTokenId?: string;
    status?: "listed" | "published";
  },
) {
  const client = await getSupabaseClient();

  if (client) {
    await client
      .from("agents")
      .update({
        onchain_agent_id: agentIdToFelt(agentId),
        onchain_registration_tx_hash: txHash,
        onchain_registered: true,
        is_minted: true,
        nft_token_id: options?.nftTokenId ?? agentIdToFelt(agentId),
        contract_address: options?.contractAddress ?? null,
        transaction_hash: txHash,
        status: options?.status ?? "listed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", agentId);
  }

  updateStoredCreatedAgent(agentId, (agent) => ({
    ...agent,
    onchainAgentId: agent.onchainAgentId ?? agentIdToFelt(agentId),
    onchainRegistrationTxHash: txHash,
    isMinted: true,
    nftTokenId: options?.nftTokenId ?? agent.nftTokenId ?? agentIdToFelt(agentId),
    contractAddress: options?.contractAddress ?? agent.contractAddress,
    transactionHash: txHash,
    status: options?.status ?? "listed",
  }));
}

export async function updateAgentListingStatus(
  agentId: string,
  status: "listed" | "unlisted",
) {
  const client = await getSupabaseClient();

  if (client) {
    await client
      .from("agents")
      .update({
        status: status === "listed" ? "listed" : "unlisted",
        is_listed: status === "listed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", agentId);
  }

  updateStoredCreatedAgent(agentId, (agent) => ({
    ...agent,
    status: status === "listed" ? "listed" : "unlisted",
    isListed: status === "listed",
  }));
}

export async function updateAgentRecord(
  agentId: string,
  updates: Partial<
    Pick<
      Agent,
      | "name"
      | "category"
      | "description"
      | "service"
      | "price"
      | "currency"
      | "systemPrompt"
      | "trainingData"
      | "status"
    >
  >,
) {
  const client = await getSupabaseClient();

  if (client) {
    await client
      .from("agents")
      .update({
        name: updates.name,
        category: updates.category,
        description: updates.description,
        service: updates.service,
        price: updates.price,
        currency: updates.currency,
        system_prompt: updates.systemPrompt,
        training_data: updates.trainingData ?? null,
        status: updates.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", agentId);
  }

  updateStoredCreatedAgent(agentId, (agent) => ({
    ...agent,
    ...updates,
  }));
}
