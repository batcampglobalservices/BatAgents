import type { Agent } from "@/types/agent";

export const agents: Agent[] = [];

export const agentCategories: Agent["category"][] = [
  "Business",
  "Study",
  "Research",
  "Coding",
  "Writing",
  "Web3",
  "Design",
];

export function getAgentById(id: string) {
  return agents.find((agent) => agent.id === id);
}
