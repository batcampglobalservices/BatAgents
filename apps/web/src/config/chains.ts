import { type Chain } from "viem";

export const ogGalileoTestnet: Chain = {
  id: 16602,
  name: "0G Galileo Testnet",
  nativeCurrency: {
    name: "0G Token",
    symbol: "0G",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://rpc.ankr.com/0g_galileo_testnet_evm"] },
    public: { http: ["https://rpc.ankr.com/0g_galileo_testnet_evm"] },
  },
  blockExplorers: {
    default: {
      name: "ChainScan Galileo",
      url: "https://chainscan-galileo.0g.ai",
    },
  },
  testnet: true,
};
