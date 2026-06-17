import type { ReputationReceipt, TaskProof, ZeroGProof } from "@/types/0g";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { saveTaskProofRecord } from "@/lib/task-proofs";
import { saveReputationReceiptRecord } from "@/lib/reputation-receipts";

async function getSupabaseClient() {
  const { getSupabaseServerClient } = await import("@/lib/supabase/server");

  return (
    getSupabaseBrowserClient() ??
    (await getSupabaseServerClient()) ??
    getSupabaseAdminClient()
  );
}

export async function createTaskProofRecord(
  proof: TaskProof,
  zeroGProof?: ZeroGProof,
) {
  const client = await getSupabaseClient();

  if (client) {
    await client.from("task_proofs").upsert({
      id: proof.id,
      agent_id: proof.agentId,
      buyer_wallet: proof.buyerWallet,
      task_summary: proof.taskSummary,
      result_summary: proof.resultSummary,
      zero_g_root_hash: zeroGProof?.rootHash ?? proof.proofRootHash,
      zero_g_tx_hash: zeroGProof?.txHash ?? proof.paymentTxHash ?? null,
      zero_g_url: zeroGProof?.url ?? null,
      zero_g_mode: zeroGProof?.mode ?? "demo",
      zero_g_status: zeroGProof?.mode === "real" ? "stored" : "demo",
      zero_g_stored_at: zeroGProof?.storedAt ?? proof.completedAt,
      created_at: proof.completedAt,
    });

    await client.from("proof_events").upsert({
      id: proof.id,
      proof_type: "task_proof",
      agent_id: proof.agentId,
      related_id: proof.id,
      root_hash: zeroGProof?.rootHash ?? proof.proofRootHash,
      tx_hash: zeroGProof?.txHash ?? proof.paymentTxHash ?? null,
      url: zeroGProof?.url ?? null,
      mode: zeroGProof?.mode ?? "demo",
      status: zeroGProof?.mode === "real" ? "stored" : "demo",
      stored_at: zeroGProof?.storedAt ?? proof.completedAt,
    });
  }

  saveTaskProofRecord(proof);
  return proof;
}

export async function createTaskProof(
  proof: TaskProof,
  zeroGProof?: ZeroGProof,
) {
  return createTaskProofRecord(proof, zeroGProof);
}

export async function createReputationReceiptRecord(
  receipt: ReputationReceipt,
  zeroGProof?: ZeroGProof,
) {
  const client = await getSupabaseClient();

  if (client) {
    await client.from("reputation_receipts").upsert({
      id: receipt.id,
      agent_id: receipt.agentId,
      reviewer_wallet: receipt.reviewerWallet,
      rating: receipt.rating,
      review: receipt.review,
      zero_g_root_hash: zeroGProof?.rootHash ?? receipt.proofRootHash,
      zero_g_tx_hash: zeroGProof?.txHash ?? null,
      zero_g_url: zeroGProof?.url ?? null,
      zero_g_mode: zeroGProof?.mode ?? "demo",
      zero_g_status: zeroGProof?.mode === "real" ? "stored" : "demo",
      zero_g_stored_at: zeroGProof?.storedAt ?? receipt.createdAt,
      created_at: receipt.createdAt,
    });

    await client.from("proof_events").upsert({
      id: receipt.id,
      proof_type: "reputation_receipt",
      agent_id: receipt.agentId,
      related_id: receipt.id,
      root_hash: zeroGProof?.rootHash ?? receipt.proofRootHash,
      tx_hash: zeroGProof?.txHash ?? null,
      url: zeroGProof?.url ?? null,
      mode: zeroGProof?.mode ?? "demo",
      status: zeroGProof?.mode === "real" ? "stored" : "demo",
      stored_at: zeroGProof?.storedAt ?? receipt.createdAt,
    });
  }

  saveReputationReceiptRecord(receipt);
  return receipt;
}

export async function createReputationReceipt(
  receipt: ReputationReceipt,
  zeroGProof?: ZeroGProof,
) {
  return createReputationReceiptRecord(receipt, zeroGProof);
}

export async function getSuperadminProofs() {
  const client = await getSupabaseClient();

  if (!client) {
    return [];
  }

  const { data } = await client.from("proof_events").select("*").order("created_at", {
    ascending: false,
  });

  return data ?? [];
}
