import type { HireRecord, PaymentTransactionRecord } from "@/types/payment";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStoredTransactions, savePaymentTransactionRecord } from "@/lib/transactions";
import { saveHireRecord } from "@/lib/hires";

async function getSupabaseClient() {
  const { getSupabaseServerClient } = await import("@/lib/supabase/server");

  return (
    getSupabaseBrowserClient() ??
    (await getSupabaseServerClient()) ??
    getSupabaseAdminClient()
  );
}

export async function createHireRecord(record: HireRecord) {
  const client = await getSupabaseClient();

  if (client) {
    await client.from("hires").upsert({
      id: record.id,
      agent_id: record.agentId,
      buyer_wallet: record.buyerWallet,
      amount: record.amount,
      currency: record.currency,
      tx_hash: record.transactionHash,
      onchain_confirmed: record.status === "paid" || record.status === "completed",
      hired_at: record.createdAt,
    });
  }

  saveHireRecord(record);
  return record;
}

export async function createHire(record: HireRecord) {
  return createHireRecord(record);
}

export async function createTransactionRecord(record: PaymentTransactionRecord) {
  const client = await getSupabaseClient();

  if (client) {
    await client.from("transactions").upsert({
      id: record.id,
      agent_id: record.agentId,
      buyer_wallet: record.buyerWallet,
      receiver_wallet: record.creatorWallet,
      amount: record.amount,
      currency: record.currency,
      network: record.network,
      tx_hash: record.txHash,
      status: record.status,
      source: record.source ?? "BatAgents Cairo Contract",
      created_at: record.createdAt,
    });
  }

  savePaymentTransactionRecord(record);
  return record;
}

export async function createTransaction(record: PaymentTransactionRecord) {
  return createTransactionRecord(record);
}

export async function getUserHires(buyerWallet?: string) {
  const client = await getSupabaseClient();

  if (client && buyerWallet) {
    const { data } = await client
      .from("hires")
      .select("*")
      .eq("buyer_wallet", buyerWallet)
      .order("hired_at", { ascending: false });

    return data ?? [];
  }

  return [];
}

export async function getLatestTransactionForAgentBuyer(
  agentId: string,
  buyerWallet: string,
) {
  const client = await getSupabaseClient();

  if (client) {
    const { data } = await client
      .from("transactions")
      .select("*")
      .eq("agent_id", agentId)
      .eq("buyer_wallet", buyerWallet)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      agentId: data.agent_id,
      agentName: "",
      buyerWallet: data.buyer_wallet ?? buyerWallet,
      creatorWallet: data.receiver_wallet ?? "",
      amount: Number(data.amount ?? 0),
      currency: data.currency ?? "ETH",
      txHash: data.tx_hash ?? "",
      status: data.status === "successful" ? "successful" : "failed",
      network: "starknet-sepolia",
      source: data.source ?? "BatAgents Cairo Contract",
      createdAt: data.created_at,
    };
  }

  const stored = getStoredTransactions().find(
    (entry) =>
      entry.agentId === agentId &&
      entry.buyerWallet.toLowerCase() === buyerWallet.toLowerCase(),
  );

  return stored ?? null;
}
