import { type AccountInterface, type Call, type ProviderInterface, uint256 } from "starknet";
import {
  BATAGENTS_CONTRACT_ADDRESS,
  isContractConfigured,
} from "./contracts";
import { agentIdToFelt, agentSlugToFelt } from "./agent-id";
import { parseTokenAmount } from "./starknet-token";

type ExecuteResponse = {
  transaction_hash: string;
};

export type RegisterAgentParams = {
  account: AccountInterface | { execute?: (calls: Call[]) => Promise<ExecuteResponse> };
  agentSlug: string;
  price: number;
  decimals?: number;
};

export type HireAgentParams = {
  account: AccountInterface | { execute?: (calls: Call[]) => Promise<ExecuteResponse> };
  agentSlug: string;
};

export type HasUserHiredParams = {
  provider: ProviderInterface | AccountInterface;
  agentSlug: string;
  buyerAddress: string;
};

type OnchainAgentStats = {
  totalHires: string;
  totalEarnings: string;
};

type StarknetReadClient = Pick<ProviderInterface, "callContract">;

function requireConfiguredContractAddress() {
  if (!isContractConfigured()) {
    throw new Error("BatAgents contract address is not configured.");
  }

  return BATAGENTS_CONTRACT_ADDRESS;
}

function buildContractCall(entrypoint: string, calldata: string[]): Call {
  return {
    contractAddress: requireConfiguredContractAddress(),
    entrypoint,
    calldata,
  };
}

function getExecuteFn(
  account: RegisterAgentParams["account"] | HireAgentParams["account"],
) {
  if (account && typeof account === "object" && "execute" in account) {
    const candidate = account as {
      execute?: (calls: Call[]) => Promise<ExecuteResponse>;
    };

    if (typeof candidate.execute === "function") {
      return candidate.execute.bind(candidate);
    }
  }

  return null;
}

function decodeUint256(parts: string[]) {
  const low = BigInt(parts[0] ?? "0");
  const high = BigInt(parts[1] ?? "0");

  return (high << BigInt(128)) + low;
}

async function readContract(
  provider: StarknetReadClient,
  entrypoint: string,
  calldata: string[],
) {
  return provider.callContract(buildContractCall(entrypoint, calldata));
}

export function getAgentOnchainId(agentSlug: string): string {
  return agentSlugToFelt(agentSlug);
}

export function agentIdToOnchainFelt(agentIdOrSlug: string): string {
  return agentIdToFelt(agentIdOrSlug);
}

export function buildRegisterAgentCall(
  agentSlug: string,
  price: number,
  decimals = 18,
): Call {
  const priceUnits = uint256.bnToUint256(parseTokenAmount(price, decimals));

  return buildContractCall("register_agent", [
    getAgentOnchainId(agentSlug),
    priceUnits.low.toString(),
    priceUnits.high.toString(),
  ]);
}

export function buildHireAgentCall(agentSlug: string, creator: string, price: bigint): Call {
  const priceUnits = uint256.bnToUint256(price);

  return buildContractCall("hire_agent", [
    getAgentOnchainId(agentSlug),
    creator,
    priceUnits.low.toString(),
    priceUnits.high.toString(),
  ]);
}

export async function registerAgentOnchain({
  account,
  agentSlug,
  price,
  decimals = 18,
}: RegisterAgentParams): Promise<string> {
  const execute = getExecuteFn(account);

  if (!execute) {
    throw new Error("Connected Starknet account is not available.");
  }

  const result = await execute([buildRegisterAgentCall(agentSlug, price, decimals)]);
  return result.transaction_hash;
}

export async function hireAgentOnchain({
  account,
  agentSlug,
}: HireAgentParams): Promise<string> {
  const execute = getExecuteFn(account);

  if (!execute) {
    throw new Error("Connected Starknet account is not available.");
  }

  const readClient = account as unknown as StarknetReadClient;
  const price = await getAgentOnchainPrice(readClient, agentSlug);
  const creator = await getAgentCreatorOnchain(readClient, agentSlug);
  const result = await execute([
    buildHireAgentCall(agentSlug, creator, BigInt(price)),
  ]);

  return result.transaction_hash;
}

export async function hasUserHiredAgentOnchain({
  provider,
  agentSlug,
  buyerAddress,
}: HasUserHiredParams): Promise<boolean> {
  const result = await readContract(provider, "has_user_hired", [
    getAgentOnchainId(agentSlug),
    buyerAddress,
  ]);

  return result[0] === "0x1" || result[0] === "1";
}

export async function getAgentOnchainPrice(
  provider: StarknetReadClient,
  agentSlug: string,
): Promise<string> {
  const result = await readContract(provider, "get_agent_price", [
    getAgentOnchainId(agentSlug),
  ]);

  return decodeUint256(result).toString();
}

export async function getAgentOnchainStats(
  provider: StarknetReadClient,
  agentSlug: string,
): Promise<OnchainAgentStats> {
  const [hiresResult, earningsResult] = await Promise.all([
    readContract(provider, "get_agent_total_hires", [getAgentOnchainId(agentSlug)]),
    readContract(provider, "get_agent_total_earnings", [getAgentOnchainId(agentSlug)]),
  ]);

  return {
    totalHires: decodeUint256(hiresResult).toString(),
    totalEarnings: decodeUint256(earningsResult).toString(),
  };
}

export async function getAgentCreatorOnchain(
  provider: StarknetReadClient,
  agentSlug: string,
): Promise<string> {
  const result = await readContract(provider, "get_agent_creator", [
    getAgentOnchainId(agentSlug),
  ]);

  return result[0] ?? "";
}
