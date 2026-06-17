import { uint256, type Call, type ProviderInterface } from "starknet";
import {
  isPaymentTokenConfigured,
  PAYMENT_TOKEN_ADDRESS,
} from "./contracts";
import { ERC20_ABI } from "./abi/erc20-abi";

const TOKEN_DECIMALS = 18;

export function parseTokenAmount(amount: number, decimals: number): bigint {
  if (!Number.isFinite(amount) || amount < 0) {
    return BigInt(0);
  }

  const [whole, fraction = ""] = amount.toString().split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  const normalized = `${whole}${paddedFraction}`.replace(/^0+(?=\d)/, "");

  return BigInt(normalized || "0");
}

function requirePaymentTokenAddress() {
  if (!isPaymentTokenConfigured()) {
    throw new Error("Payment token address is not configured.");
  }

  return PAYMENT_TOKEN_ADDRESS;
}

function buildApproveCall(spender: string, amount: bigint): Call {
  const tokenAmount = uint256.bnToUint256(amount);

  return {
    contractAddress: requirePaymentTokenAddress(),
    entrypoint: "approve",
    calldata: [spender, tokenAmount.low.toString(), tokenAmount.high.toString()],
  };
}

function buildReadCall(entrypoint: string, calldata: string[], tokenAddress = requirePaymentTokenAddress()): Call {
  return {
    contractAddress: tokenAddress,
    entrypoint,
    calldata,
  };
}

function resolveExecutor(account: unknown) {
  if (!account || typeof account !== "object") {
    return null;
  }

  const candidate = account as {
    execute?: (calls: Call[]) => Promise<{ transaction_hash: string }>;
    invoke?: (method: string, args?: unknown[]) => Promise<{ transaction_hash: string }>;
  };

  if (typeof candidate.execute === "function") {
    return candidate;
  }

  if (typeof candidate.invoke === "function") {
    return candidate;
  }

  return null;
}

export async function approvePaymentToken(params: {
  account: unknown;
  spender: string;
  amount: bigint;
}): Promise<string> {
  const executor = resolveExecutor(params.account);

  if (!executor) {
    throw new Error("Connected Starknet account is not available.");
  }

  const call = buildApproveCall(params.spender, params.amount);
  const calldata = Array.isArray(call.calldata)
    ? (call.calldata as string[])
    : [];

  if (typeof executor.execute === "function") {
    const result = await executor.execute([call]);
    return result.transaction_hash;
  }

  const result = await executor.invoke?.("approve", [
    calldata[0] ?? params.spender,
    calldata[1] ?? "0",
    calldata[2] ?? "0",
  ]);

  if (!result) {
    throw new Error("Payment approval failed.");
  }

  return result.transaction_hash;
}

export function getPaymentTokenDecimals() {
  return TOKEN_DECIMALS;
}

async function readTokenValue(
  provider: Pick<ProviderInterface, "callContract">,
  entrypoint: string,
  calldata: string[],
) {
  const result = await provider.callContract(buildReadCall(entrypoint, calldata));
  const low = BigInt(result[0] ?? "0");
  const high = BigInt(result[1] ?? "0");

  return (high << BigInt(128)) + low;
}

export async function getPaymentTokenBalance(
  provider: Pick<ProviderInterface, "callContract">,
  owner: string,
) {
  return readTokenValue(provider, "balanceOf", [owner]);
}

export async function getPaymentTokenAllowance(
  provider: Pick<ProviderInterface, "callContract">,
  owner: string,
  spender: string,
) {
  return readTokenValue(provider, "allowance", [owner, spender]);
}

export { ERC20_ABI };
