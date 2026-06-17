export type HireRecord = {
  id: string;
  agentId: string;
  buyerWallet: string;
  transactionHash: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "completed";
  createdAt: string;
  source?: string;
};

export type PaymentTransactionRecord = {
  id: string;
  agentId: string;
  agentName: string;
  buyerWallet: string;
  creatorWallet: string;
  amount: number;
  currency: string;
  txHash: string;
  status: "initiated" | "successful" | "failed";
  network: "starknet-sepolia";
  source?: string;
  createdAt: string;
};

export type UnlockedAgentRecord = {
  agentId: string;
  buyerWallet: string;
  transactionHash: string;
  createdAt: string;
};
