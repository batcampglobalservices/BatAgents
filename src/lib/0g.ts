import type {
  AgentMetadataProof,
  ReputationReceipt,
  TaskProof,
  ZeroGProof,
} from "@/types/0g";
import { ZERO_G_EXPLORER_URL } from "./0g-config";

const MOCK_0G_STORED_AT = "2026-06-16T12:00:00.000Z";

function stableStringify(value: unknown): string {
  if (value === undefined) {
    return "undefined";
  }

  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(
    ([left], [right]) => left.localeCompare(right),
  );

  return `{${entries
    .map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify(entryValue)}`)
    .join(",")}}`;
}

function toMockHash(namespace: string, input: unknown) {
  const payload = `${namespace}:${stableStringify(input)}`;
  let hash = 2166136261;

  for (let index = 0; index < payload.length; index += 1) {
    hash ^= payload.charCodeAt(index);
    hash +=
      (hash << 1) +
      (hash << 4) +
      (hash << 7) +
      (hash << 8) +
      (hash << 24);
  }

  return `0x0g_${namespace}_${Math.abs(hash).toString(16).padStart(12, "0")}`;
}

async function createMockProof(namespace: string, input: unknown): Promise<ZeroGProof> {
  const rootHash = toMockHash(namespace, input);

  return {
    rootHash,
    txHash: `0x0g_tx_${namespace}_${rootHash.slice(-12)}`,
    url: ZERO_G_EXPLORER_URL || `https://0g.example/mock/${namespace}/${rootHash.slice(-8)}`,
    storedAt: MOCK_0G_STORED_AT,
    mode: "demo",
  };
}

export async function uploadAgentMetadataTo0G(
  metadata: unknown,
): Promise<ZeroGProof> {
  // MVP placeholder: this will be replaced with the real 0G Storage SDK upload call.
  return createMockProof("agent-metadata", metadata);
}

export async function uploadTaskProofTo0G(proof: unknown): Promise<ZeroGProof> {
  // MVP placeholder: this will be replaced with the real 0G Storage SDK upload call.
  return createMockProof("task-proof", proof);
}

export async function uploadReputationReceiptTo0G(
  receipt: unknown,
): Promise<ZeroGProof> {
  // MVP placeholder: this will be replaced with the real 0G Storage SDK upload call.
  return createMockProof("reputation-receipt", receipt);
}

export function buildAgentMetadataProof(
  metadata: AgentMetadataProof,
): ZeroGProof {
  return {
    rootHash: metadata.metadataRootHash,
    txHash: `0x0g_tx_agent_metadata_${metadata.metadataRootHash.slice(-12)}`,
    url: ZERO_G_EXPLORER_URL || `https://0g.example/mock/agent-metadata/${metadata.agentId}`,
    storedAt: metadata.storedAt,
    mode: "demo",
  };
}

export function buildTaskProof(task: TaskProof): ZeroGProof {
  return {
    rootHash: task.proofRootHash,
    txHash: task.paymentTxHash,
    url: ZERO_G_EXPLORER_URL || `https://0g.example/mock/task-proof/${task.id}`,
    storedAt: task.completedAt,
    mode: "demo",
  };
}

export function buildReputationReceipt(
  receipt: ReputationReceipt,
): ZeroGProof {
  return {
    rootHash: receipt.proofRootHash,
    url: ZERO_G_EXPLORER_URL || `https://0g.example/mock/reputation-receipt/${receipt.id}`,
    storedAt: receipt.createdAt,
    mode: "demo",
  };
}
