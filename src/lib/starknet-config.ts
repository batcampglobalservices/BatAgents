import { sepolia } from "@starknet-react/chains";
import { PAYMENT_TOKEN_ADDRESS, STARKNET_NETWORK as CONTRACT_NETWORK } from "./contracts";

export const STARKNET_NETWORK = "sepolia";

export const STARKNET_CHAIN = sepolia;

export const DEFAULT_PAYMENT_TOKEN = {
  symbol: "ETH",
  decimals: 18,
  address: PAYMENT_TOKEN_ADDRESS || sepolia.nativeCurrency.address,
};

export const PLATFORM_RECEIVER_ADDRESS =
  process.env.NEXT_PUBLIC_PLATFORM_RECEIVER_ADDRESS?.trim() ?? "";

export const CONFIGURED_STARKNET_NETWORK =
  CONTRACT_NETWORK || STARKNET_NETWORK;
