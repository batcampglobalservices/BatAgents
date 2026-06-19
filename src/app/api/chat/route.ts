import { groq } from "@ai-sdk/groq";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import type { Agent } from "@/types/agent";
import { getAgentReviews } from "@/lib/db/reviews";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AgentCategory } from "@/types/agent";

export const maxDuration = 30;

type ChatRequestBody = {
  messages?: UIMessage[];
  agent?: Partial<Agent>;
  agentSlug?: string;
  agentId?: string;
};

function normalizeAgent(agent: Partial<Agent> & Pick<Agent, "id" | "slug" | "name" | "category" | "description" | "service">): Agent {
  return {
    id: agent.id,
    slug: agent.slug,
    name: agent.name,
    category: agent.category ?? "Business",
    description: agent.description ?? "",
    service: agent.service ?? "",
    price: agent.price ?? 0,
    currency: agent.currency ?? "STRK",
    rating: agent.rating ?? 5,
    completedJobs: agent.completedJobs ?? 0,
    creator: agent.creator ?? "Batcamp Studio",
    creatorWallet: agent.creatorWallet ?? "",
    creatorId: agent.creatorId,
    systemPrompt: agent.systemPrompt?.trim() || "You are a helpful AI agent.",
    trainingData: agent.trainingData?.trim() || "",
    sampleQuestions: Array.isArray(agent.sampleQuestions) ? agent.sampleQuestions : [],
    createdAt: agent.createdAt ?? new Date().toISOString(),
    status: agent.status ?? "listed",
    isListed: agent.isListed ?? true,
    isMinted: agent.isMinted ?? false,
    nftTokenId: agent.nftTokenId,
    contractAddress: agent.contractAddress,
    transactionHash: agent.transactionHash,
    zeroGProof: agent.zeroGProof,
    onchainAgentId: agent.onchainAgentId,
    onchainRegistrationTxHash: agent.onchainRegistrationTxHash,
    creatorUser: agent.creatorUser,
    publishedAt: agent.publishedAt,
  };
}

function normalizeCategory(category: string | null | undefined): AgentCategory {
  switch (category) {
    case "Study":
    case "Research":
    case "Coding":
    case "Writing":
    case "Web3":
    case "Design":
      return category;
    case "Business":
    default:
      return "Business";
  }
}

async function fetchAgentFromSupabase(
  agentSlug?: string,
  agentId?: string,
): Promise<Agent | null> {
  const adminClient = getSupabaseAdminClient();
  const serverClient = await getSupabaseServerClient();
  const client = adminClient ?? serverClient ?? getSupabaseBrowserClient();

  if (!client) {
    return null;
  }

  if (agentSlug) {
    const { data, error } = await client
      .from("agents")
      .select("*")
      .eq("slug", agentSlug)
      .maybeSingle();

    console.error("CHAT_AGENT_SLUG", agentSlug);
    console.error("CHAT_AGENT_DATA", data);
    console.error("CHAT_AGENT_ERROR", error);

    if (error) {
      return null;
    }

    if (data) {
      return normalizeAgent({
        id: data.id,
        slug: data.slug,
        name: data.name,
        category: normalizeCategory(data.category),
        description: data.description,
        service: data.service,
        price: Number(data.price ?? 0),
        currency: data.currency === "ETH" ? "ETH" : "STRK",
        rating: 5,
        completedJobs: 0,
        creator: data.creator_wallet ? "Supabase Creator" : "Batcamp Studio",
        creatorWallet: data.creator_wallet ?? "",
        creatorId: data.creator_id ?? undefined,
        systemPrompt: data.system_prompt ?? undefined,
        trainingData: data.training_data ?? undefined,
        sampleQuestions: [],
        createdAt: data.created_at,
        status: data.status ?? "listed",
        isListed: Boolean(data.is_listed),
        isMinted: Boolean(data.is_minted),
        nftTokenId: data.nft_token_id ?? undefined,
        contractAddress: data.contract_address ?? undefined,
        transactionHash: data.transaction_hash ?? undefined,
        zeroGProof: data.zero_g_root_hash
          ? {
              rootHash: data.zero_g_root_hash,
              txHash: data.zero_g_tx_hash ?? undefined,
              url: data.zero_g_url ?? undefined,
              storedAt: data.zero_g_stored_at ?? data.created_at,
              mode: (data.zero_g_mode as "demo" | "stored") ?? "demo",
            }
          : undefined,
        onchainAgentId: data.onchain_agent_id ?? undefined,
        onchainRegistrationTxHash: data.onchain_registration_tx_hash ?? undefined,
      });
    }
  }

  if (agentId) {
    const { data, error } = await client
      .from("agents")
      .select("*")
      .eq("id", agentId)
      .maybeSingle();

    console.error("CHAT_AGENT_SLUG", agentId);
    console.error("CHAT_AGENT_DATA", data);
    console.error("CHAT_AGENT_ERROR", error);

    if (error) {
      return null;
    }

    if (data) {
      return normalizeAgent({
        id: data.id,
        slug: data.slug,
        name: data.name,
        category: normalizeCategory(data.category),
        description: data.description,
        service: data.service,
        price: Number(data.price ?? 0),
        currency: data.currency === "ETH" ? "ETH" : "STRK",
        rating: 5,
        completedJobs: 0,
        creator: data.creator_wallet ? "Supabase Creator" : "Batcamp Studio",
        creatorWallet: data.creator_wallet ?? "",
        creatorId: data.creator_id ?? undefined,
        systemPrompt: data.system_prompt ?? undefined,
        trainingData: data.training_data ?? undefined,
        sampleQuestions: [],
        createdAt: data.created_at,
        status: data.status ?? "listed",
        isListed: Boolean(data.is_listed),
        isMinted: Boolean(data.is_minted),
        nftTokenId: data.nft_token_id ?? undefined,
        contractAddress: data.contract_address ?? undefined,
        transactionHash: data.transaction_hash ?? undefined,
        zeroGProof: data.zero_g_root_hash
          ? {
              rootHash: data.zero_g_root_hash,
              txHash: data.zero_g_tx_hash ?? undefined,
              url: data.zero_g_url ?? undefined,
              storedAt: data.zero_g_stored_at ?? data.created_at,
              mode: (data.zero_g_mode as "demo" | "stored") ?? "demo",
            }
          : undefined,
        onchainAgentId: data.onchain_agent_id ?? undefined,
        onchainRegistrationTxHash: data.onchain_registration_tx_hash ?? undefined,
      });
    }
  }

  return null;
}

function buildSystemPrompt(agent: Agent, recentFeedback: string) {
  return `You are ${agent.name}, a paid AI agent on BatAgents.

Category: ${agent.category}
Service: ${agent.service}
Description: ${agent.description}

Your creator configured you with these instructions:
${agent.systemPrompt}

Recent buyer feedback and usage context:
${recentFeedback || "No buyer feedback has been recorded yet."}

Your job is to help the user complete tasks related to your service.

Answer like a focused digital worker:
- Be practical
- Be specific
- Stay on task
- Give structured responses when useful
- Avoid generic AI disclaimers
- Ask clarifying questions only when needed
- Do not mention internal implementation details
- Do not claim payment was processed
`;
}

export async function POST(request: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return Response.json(
        { error: "GROQ_API_KEY is missing from the environment." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as ChatRequestBody;
    const messages = body.messages ?? [];
    const requestedAgent = body.agent;
    const requestedSlug = body.agentSlug?.trim() || requestedAgent?.slug?.trim() || "";
    const requestedId = body.agentId?.trim() || requestedAgent?.id?.trim() || "";
    console.error("CHAT_ROUTE_ERROR", {
      messages: messages.length,
      hasAgent: Boolean(requestedAgent),
      requestedSlug,
      requestedId,
    });

    if (!messages.length) {
      return Response.json({ error: "Messages are required." }, { status: 400 });
    }

    if (!requestedAgent && !requestedSlug && !requestedId) {
      return Response.json({ error: "Agent is required." }, { status: 400 });
    }

    const selectedAgent =
      (requestedSlug ? await fetchAgentFromSupabase(requestedSlug, undefined) : null) ??
      (requestedId ? await fetchAgentFromSupabase(undefined, requestedId) : null) ??
      (requestedAgent?.id && requestedAgent?.slug
        ? normalizeAgent({
            id: requestedAgent.id,
            slug: requestedAgent.slug,
            name: requestedAgent.name ?? "BatAgents Agent",
            category: requestedAgent.category ?? "Business",
            description: requestedAgent.description ?? "",
            service: requestedAgent.service ?? "",
            price: requestedAgent.price ?? 0,
            currency: requestedAgent.currency ?? "STRK",
            rating: requestedAgent.rating ?? 5,
            completedJobs: requestedAgent.completedJobs ?? 0,
            creator: requestedAgent.creator ?? "Batcamp Studio",
            creatorWallet: requestedAgent.creatorWallet ?? "",
            creatorId: requestedAgent.creatorId,
            systemPrompt: requestedAgent.systemPrompt,
            trainingData: requestedAgent.trainingData,
            sampleQuestions: requestedAgent.sampleQuestions ?? [],
            createdAt: requestedAgent.createdAt ?? new Date().toISOString(),
            status: requestedAgent.status ?? "listed",
            isListed: requestedAgent.isListed ?? true,
            isMinted: requestedAgent.isMinted ?? false,
            nftTokenId: requestedAgent.nftTokenId,
            contractAddress: requestedAgent.contractAddress,
            transactionHash: requestedAgent.transactionHash,
            zeroGProof: requestedAgent.zeroGProof,
            onchainAgentId: requestedAgent.onchainAgentId,
            onchainRegistrationTxHash: requestedAgent.onchainRegistrationTxHash,
            creatorUser: requestedAgent.creatorUser,
            publishedAt: requestedAgent.publishedAt,
          })
        : null);

    if (!selectedAgent) {
      return Response.json({ error: "Agent not found." }, { status: 404 });
    }

    const recentReviews = await getAgentReviews(selectedAgent.id, 5);
    const safeAgent = normalizeAgent(selectedAgent);
    const recentFeedback = recentReviews.length
      ? recentReviews
          .map((review) => `- ${review.rating}/5: ${review.review ?? "No comment"} (${review.created_at})`)
          .join("\n")
      : "";

    const result = streamText({
      model: groq("llama-3.1-8b-instant"),
      system: buildSystemPrompt(
        {
          ...safeAgent,
          systemPrompt: safeAgent.systemPrompt?.trim() || "You are a helpful AI agent.",
          trainingData: safeAgent.trainingData?.trim() || "",
        },
        recentFeedback,
      ),
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({
      onError: () => "The agent could not complete the response.",
    });
  } catch (error) {
    console.error("CHAT_ROUTE_ERROR", error);
    return Response.json(
      { error: "Unable to process the chat request." },
      { status: 400 },
    );
  }
}
