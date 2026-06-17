export const STARKNET_NETWORK =
  process.env.NEXT_PUBLIC_STARKNET_NETWORK?.trim().toLowerCase() || "sepolia";

export const BATAGENTS_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_BATAGENTS_CONTRACT_ADDRESS?.trim() ?? "";

export const PAYMENT_TOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS?.trim() ?? "";

export function isContractConfigured() {
  return BATAGENTS_CONTRACT_ADDRESS.length > 0;
}

export function isPaymentTokenConfigured() {
  return PAYMENT_TOKEN_ADDRESS.length > 0;
}
