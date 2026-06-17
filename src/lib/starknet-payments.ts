import { validateAndParseAddress, uint256, type Call } from "starknet";
import { DEFAULT_PAYMENT_TOKEN, PLATFORM_RECEIVER_ADDRESS } from "./starknet-config";

const STARKNET_RECEIPT_TIMEOUT_MS = 120_000;
const STARKNET_POLL_INTERVAL_MS = 1_500;

export function parseTokenAmount(amount: number, decimals: number): bigint {
  if (!Number.isFinite(amount) || amount < 0) {
    return BigInt(0);
  }

  const [whole, fraction = ""] = amount.toString().split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  const normalized = `${whole}${paddedFraction}`.replace(/^0+(?=\d)/, "");

  return BigInt(normalized || "0");
}

export function shortenAddress(address: string) {
  if (!address) {
    return "";
  }

  const normalized = address.trim();

  if (normalized.length <= 12) {
    return normalized;
  }

  return `${normalized.slice(0, 6)}...${normalized.slice(-4)}`;
}

export function isValidStarknetAddress(address: string) {
  try {
    validateAndParseAddress(address);
    return true;
  } catch {
    return false;
  }
}

export function getPaymentReceiverAddress(creatorWallet?: string) {
  if (creatorWallet && isValidStarknetAddress(creatorWallet)) {
    return creatorWallet;
  }

  if (isValidStarknetAddress(PLATFORM_RECEIVER_ADDRESS)) {
    return PLATFORM_RECEIVER_ADDRESS;
  }

  return "";
}

export function buildPaymentCall(
  tokenAddress: string,
  receiverAddress: string,
  amount: number,
  decimals = DEFAULT_PAYMENT_TOKEN.decimals,
): Call {
  const parsedAmount = uint256.bnToUint256(parseTokenAmount(amount, decimals));

  return {
    contractAddress: tokenAddress,
    entrypoint: "transfer",
    calldata: [
      receiverAddress,
      parsedAmount.low.toString(),
      parsedAmount.high.toString(),
    ],
  };
}

async function sleep(ms: number) {
  await new Promise((resolve) => window.setTimeout(resolve, ms));
}

function resolveReceiptProvider(providerOrAccount: unknown) {
  if (!providerOrAccount || typeof providerOrAccount !== "object") {
    return null;
  }

  const candidate = providerOrAccount as {
    waitForTransaction?: (
      txHash: string,
      options?: {
        retryInterval?: number;
        successStates?: string[];
        errorStates?: string[];
      },
    ) => Promise<{ finality_status?: string; execution_status?: string }>;
    getTransactionReceipt?: (
      txHash: string,
    ) => Promise<{ finality_status?: string; execution_status?: string }>;
    provider?: {
      waitForTransaction?: (
        txHash: string,
        options?: {
          retryInterval?: number;
          successStates?: string[];
          errorStates?: string[];
        },
      ) => Promise<{ finality_status?: string; execution_status?: string }>;
      getTransactionReceipt?: (
        txHash: string,
      ) => Promise<{ finality_status?: string; execution_status?: string }>;
    };
  };

  if (typeof candidate.waitForTransaction === "function") {
    return candidate;
  }

  if (candidate.provider && typeof candidate.provider.waitForTransaction === "function") {
    return candidate.provider;
  }

  if (typeof candidate.getTransactionReceipt === "function") {
    return candidate;
  }

  if (candidate.provider && typeof candidate.provider.getTransactionReceipt === "function") {
    return candidate.provider;
  }

  return null;
}

export async function waitForStarknetTransaction(
  providerOrAccount: unknown,
  txHash: string,
): Promise<"accepted" | "rejected" | "error"> {
  const provider = resolveReceiptProvider(providerOrAccount);

  if (!provider) {
    return "error";
  }

  const start = Date.now();

  while (Date.now() - start < STARKNET_RECEIPT_TIMEOUT_MS) {
    try {
      const receipt = await provider.getTransactionReceipt!(txHash);
      const finalityStatus = receipt.finality_status;
      const executionStatus = receipt.execution_status;

      if (
        finalityStatus === "REJECTED" ||
        executionStatus === "REVERTED"
      ) {
        return "rejected";
      }

      if (
        finalityStatus === "ACCEPTED_ON_L2" ||
        finalityStatus === "ACCEPTED_ON_L1" ||
        executionStatus === "SUCCEEDED"
      ) {
        return "accepted";
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "";

      if (
        message.includes("Transaction hash not found") ||
        message.includes("not found") ||
        message.includes("received")
      ) {
        await sleep(STARKNET_POLL_INTERVAL_MS);
        continue;
      }

      return "error";
    }

    await sleep(STARKNET_POLL_INTERVAL_MS);
  }

  return "error";
}
