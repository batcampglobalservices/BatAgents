import type { Agent } from "@/types/agent";
import { emitStoredChange, readStoredJson, readStoredSnapshot, writeStoredJson } from "./local-store";

const CREATED_AGENTS_STORAGE_KEY = "batagents.createdAgents";
const CREATED_AGENTS_CHANGE_EVENT = "batagents.created-agents-change";

export type CreatedAgentRecord = Agent & {
  creatorUser?: string;
  onchainRegistrationTxHash?: string;
  publishedAt: string;
};

function normalizeAgent(agent: CreatedAgentRecord): CreatedAgentRecord {
  return {
    ...agent,
    sampleQuestions: Array.isArray(agent.sampleQuestions) ? agent.sampleQuestions : [],
    zeroGProof: agent.zeroGProof,
  };
}

export function getStoredCreatedAgentsSnapshot() {
  return readStoredSnapshot(CREATED_AGENTS_STORAGE_KEY);
}

export function getStoredCreatedAgents(): CreatedAgentRecord[] {
  return readStoredJson<CreatedAgentRecord[]>(CREATED_AGENTS_STORAGE_KEY, []).map(
    normalizeAgent,
  );
}

export function saveCreatedAgent(agent: CreatedAgentRecord) {
  const next = [normalizeAgent(agent), ...getStoredCreatedAgents()];
  writeStoredJson(CREATED_AGENTS_STORAGE_KEY, next);
  emitStoredChange(CREATED_AGENTS_CHANGE_EVENT);
}

export function updateCreatedAgent(
  agentId: string,
  updater: (agent: CreatedAgentRecord) => CreatedAgentRecord,
) {
  const next = getStoredCreatedAgents().map((agent) =>
    agent.id === agentId ? normalizeAgent(updater(agent)) : agent,
  );

  writeStoredJson(CREATED_AGENTS_STORAGE_KEY, next);
  emitStoredChange(CREATED_AGENTS_CHANGE_EVENT);
}

export function subscribeCreatedAgentsStore(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => onStoreChange();
  window.addEventListener(CREATED_AGENTS_CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(CREATED_AGENTS_CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function mergePublishedAgents(staticAgents: Agent[]) {
  const createdAgents = getStoredCreatedAgents();
  const bySlug = new Map<string, Agent>();

  for (const agent of staticAgents) {
    bySlug.set(agent.slug, agent);
  }

  for (const agent of createdAgents) {
    bySlug.set(agent.slug, agent);
  }

  return Array.from(bySlug.values());
}

export function getPublishedAgentBySlug(
  staticAgents: Agent[],
  slugOrId: string,
): Agent | undefined {
  const normalized = slugOrId.trim().toLowerCase();
  return mergePublishedAgents(staticAgents).find(
    (agent) => agent.slug === normalized || agent.id === normalized,
  );
}
