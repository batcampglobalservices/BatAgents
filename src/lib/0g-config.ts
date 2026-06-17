export const ZERO_G_NETWORK =
  process.env.NEXT_PUBLIC_ZEROG_NETWORK?.trim() || "testnet";

export const ZERO_G_EXPLORER_URL =
  process.env.NEXT_PUBLIC_ZEROG_EXPLORER_URL?.trim() ?? "";

export const ZERO_G_RPC_URL = process.env.ZEROG_RPC_URL?.trim() ?? "";
export const ZERO_G_INDEXER_RPC = process.env.ZEROG_INDEXER_RPC?.trim() ?? "";
export const ZERO_G_FLOW_ADDRESS = process.env.ZEROG_FLOW_ADDRESS?.trim() ?? "";

export function isZeroGConfigured() {
  return ZERO_G_RPC_URL.length > 0 && ZERO_G_INDEXER_RPC.length > 0;
}

export function isZeroGExplorerConfigured() {
  return ZERO_G_EXPLORER_URL.length > 0;
}

export function getZeroGModeLabel() {
  return isZeroGConfigured() ? "Stored on 0G" : "0G Testnet Proof";
}
