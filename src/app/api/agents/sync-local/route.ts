import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CreatedAgentRecord } from "@/lib/created-agents";

type SyncRequestBody = {
  agents?: CreatedAgentRecord[];
  creatorId?: string;
};

function isAgentRecord(agent: CreatedAgentRecord | null | undefined): agent is CreatedAgentRecord {
  return Boolean(
    agent &&
      typeof agent.id === "string" &&
      typeof agent.slug === "string" &&
      typeof agent.name === "string" &&
      typeof agent.category === "string" &&
      typeof agent.description === "string" &&
      typeof agent.service === "string" &&
      typeof agent.price === "number" &&
      typeof agent.currency === "string" &&
      typeof agent.creator === "string" &&
      typeof agent.creatorWallet === "string" &&
      typeof agent.systemPrompt === "string" &&
      Array.isArray(agent.sampleQuestions) &&
      typeof agent.createdAt === "string" &&
      typeof agent.publishedAt === "string",
  );
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase admin access is not configured." },
      { status: 503 },
    );
  }

  let body: SyncRequestBody;

  try {
    body = (await request.json()) as SyncRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid sync payload." }, { status: 400 });
  }

  const agents = (body.agents ?? []).filter(isAgentRecord);

  if (agents.length === 0) {
    return NextResponse.json({ synced: 0, message: "No local agents to sync." });
  }

  const creatorId = typeof body.creatorId === "string" ? body.creatorId : null;
  let synced = 0;

  for (const agent of agents) {
    const { error } = await supabase.from("agents").upsert({
      id: agent.id,
      slug: agent.slug,
      name: agent.name,
      category: agent.category,
      description: agent.description,
      service: agent.service,
      system_prompt: agent.systemPrompt,
      price: agent.price,
      currency: agent.currency,
      creator_id: creatorId,
      creator_wallet: agent.creatorWallet,
      status: agent.status ?? "listed",
      zero_g_root_hash: agent.zeroGProof?.rootHash ?? null,
      zero_g_tx_hash: agent.zeroGProof?.txHash ?? null,
      zero_g_url: agent.zeroGProof?.url ?? null,
      zero_g_mode: agent.zeroGProof?.mode ?? "demo",
      zero_g_status: agent.zeroGProof ? "stored" : "pending",
      zero_g_stored_at: agent.zeroGProof?.storedAt ?? null,
      onchain_registration_tx_hash: agent.onchainRegistrationTxHash ?? null,
      onchain_agent_id: agent.onchainAgentId ?? null,
      onchain_registered: Boolean(agent.onchainRegistrationTxHash),
      created_at: agent.createdAt,
      updated_at: new Date().toISOString(),
    });

    if (!error) {
      synced += 1;
    }
  }

  return NextResponse.json({
    synced,
    total: agents.length,
  });
}
