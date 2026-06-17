export type MockTransaction = {
  transactionHash: string;
  buyer: string;
  creator: string;
  agent: string;
  amount: string;
  status: "confirmed" | "pending" | "failed";
  network: "Starknet Sepolia";
  source: "batagents-cairo-contract";
  date: string;
};

export const mockTransactions: MockTransaction[] = [
  {
    transactionHash: "0x0g_tx_aa01_0001",
    buyer: "Amina Yusuf",
    creator: "Batcamp Studio",
    agent: "Pitch Coach Agent",
    amount: "12 STRK",
    status: "confirmed",
    network: "Starknet Sepolia",
    source: "batagents-cairo-contract",
    date: "2026-06-16T12:00:00.000Z",
  },
  {
    transactionHash: "0x0g_tx_aa02_0001",
    buyer: "Amina Yusuf",
    creator: "Signal Forge",
    agent: "Research Agent",
    amount: "14 STRK",
    status: "confirmed",
    network: "Starknet Sepolia",
    source: "batagents-cairo-contract",
    date: "2026-06-15T10:12:00.000Z",
  },
  {
    transactionHash: "0x0g_tx_aa03_0001",
    buyer: "Amina Yusuf",
    creator: "Dev Grid",
    agent: "Code Explainer Agent",
    amount: "11 STRK",
    status: "pending",
    network: "Starknet Sepolia",
    source: "batagents-cairo-contract",
    date: "2026-06-14T19:22:00.000Z",
  },
  {
    transactionHash: "0x0g_tx_aa04_0001",
    buyer: "Nia Adeyemi",
    creator: "Chain Studio",
    agent: "Web3 Guide Agent",
    amount: "15 ETH",
    status: "confirmed",
    network: "Starknet Sepolia",
    source: "batagents-cairo-contract",
    date: "2026-06-13T16:40:00.000Z",
  },
];
