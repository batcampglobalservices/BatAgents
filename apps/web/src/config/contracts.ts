export const CONTRACT_ADDRESSES = {
  royalties: process.env.NEXT_PUBLIC_ROYALTIES_ADDRESS || "",
  mockOracle: process.env.NEXT_PUBLIC_MOCK_ORACLE_ADDRESS || "",
  agentNft: process.env.NEXT_PUBLIC_AGENT_NFT_ADDRESS || "",
  agentFactory: process.env.NEXT_PUBLIC_AGENT_FACTORY_ADDRESS || "",
  marketplace: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "",
  accessControl: process.env.NEXT_PUBLIC_ACCESS_CONTROL_ADDRESS || "",
  usageTracker: process.env.NEXT_PUBLIC_USAGE_TRACKER_ADDRESS || "",
};

export const hasDeployedContracts = () => {
  return Object.values(CONTRACT_ADDRESSES).every((addr) => addr !== "");
};
