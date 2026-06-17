export type ZeroGProof = {
  rootHash: string;
  txHash?: string;
  url?: string;
  storedAt: string;
  mode?: "demo" | "real";
};

export type AgentMetadataProof = {
  agentId: string;
  agentName: string;
  creatorWallet: string;
  metadataRootHash: string;
  storedAt: string;
};

export type TaskProof = {
  id: string;
  agentId: string;
  buyerWallet: string;
  taskSummary: string;
  resultSummary: string;
  paymentTxHash?: string;
  proofRootHash: string;
  completedAt: string;
  url?: string;
  mode?: "demo" | "real";
};

export type ReputationReceipt = {
  id: string;
  agentId: string;
  rating: number;
  review: string;
  reviewerWallet: string;
  proofRootHash: string;
  createdAt: string;
};
