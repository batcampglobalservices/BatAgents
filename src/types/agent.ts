import type { ZeroGProof } from "@/types/0g";

export type AgentCategory =
  | "Business"
  | "Study"
  | "Research"
  | "Coding"
  | "Writing"
  | "Web3"
  | "Design";

export type Agent = {
  id: string;
  name: string;
  slug: string;
  category: AgentCategory;
  description: string;
  service: string;
  price: number;
  currency: "STRK" | "ETH";
  rating: number;
  completedJobs: number;
  creator: string;
  creatorWallet: string;
  creatorId?: string;
  systemPrompt: string;
  trainingData?: string;
  sampleQuestions: string[];
  createdAt: string;
  status?: "draft" | "listed" | "published" | "unlisted";
  isListed?: boolean;
  isMinted?: boolean;
  nftTokenId?: string;
  contractAddress?: string;
  transactionHash?: string;
  zeroGProof?: ZeroGProof;
  onchainAgentId?: string;
  onchainRegistrationTxHash?: string;
  creatorUser?: string;
  publishedAt?: string;
};

export type Hire = {
  id: string;
  agentId: string;
  buyerWallet: string;
  transactionHash: string;
  amount: number;
  status: "pending" | "paid" | "completed";
  createdAt: string;
};

export type Review = {
  id: string;
  agentId: string;
  buyerWallet: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
};

export type Transaction = {
  id: string;
  agentId: string;
  wallet: string;
  hash: string;
  amount: number;
  currency: "STRK" | "ETH";
  status: "initiated" | "confirmed" | "failed";
  createdAt: string;
};
