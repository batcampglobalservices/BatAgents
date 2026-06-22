export const BRAND_COLORS = {
  primary: "#EA6002", // Orange
  background: "#0A0A0F",
  surface: "#12121A",
  surfaceBorder: "rgba(255, 255, 255, 0.06)",
  glow: "rgba(234, 96, 2, 0.15)",
};

export const OG_NETWORKS = {
  testnet: {
    chainId: 16602,
    rpcUrl: "https://rpc.ankr.com/0g_galileo_testnet_evm",
    chainScan: "https://chainscan-galileo.0g.ai",
    storageScan: "https://storagescan-galileo.0g.ai",
    storageIndexer: "https://indexer-storage-testnet-turbo.0g.ai",
    computeRouter: "https://router-api-testnet.integratenetwork.work/v1",
    faucet: "https://faucet.0g.ai",
  },
  mainnet: {
    chainId: 16661,
    rpcUrl: "https://evmrpc.0g.ai",
    chainScan: "https://chainscan.0g.ai",
    storageScan: "https://storagescan.0g.ai",
    storageIndexer: "https://indexer-storage-turbo.0g.ai",
    computeRouter: "https://router-api.0g.ai/v1",
    faucet: "",
  },
};

export const MODEL_OPTIONS = [
  { id: "zai-org/GLM-5-FP8", name: "GLM-5 FP8 (zai-org)" },
  { id: "Qwen/Qwen2.5-72B-Instruct", name: "Qwen 2.5 72B Instruct" },
  { id: "meta-llama/Llama-3-70b-chat-hf", name: "Llama 3 70B Chat" },
];
