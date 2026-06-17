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
  agentOnchainId?: string;
};

export type HireAgentParams = {
  account: AccountInterface | { execute?: (calls: Call[]) => Promise<ExecuteResponse> };
  agentSlug: string;
  agentOnchainId?: string;
};

export type HasUserHiredParams = {
  provider: ProviderInterface | AccountInterface;
  agentSlug: string;
  buyerAddress: string;
  agentOnchainId?: string;
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

function resolveAgentOnchainId(agentSlug: string, explicitOnchainId?: string) {
  return explicitOnchainId?.trim() || getAgentOnchainId(agentSlug);
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
  agentOnchainId?: string,
): Call {
  const priceUnits = uint256.bnToUint256(parseTokenAmount(price, decimals));

  return buildContractCall("register_agent", [
    resolveAgentOnchainId(agentSlug, agentOnchainId),
    priceUnits.low.toString(),
    priceUnits.high.toString(),
  ]);
}

export function buildHireAgentCall(
  agentSlug: string,
  creator: string,
  price: bigint,
  agentOnchainId?: string,
): Call {
  const priceUnits = uint256.bnToUint256(price);

  return buildContractCall("hire_agent", [
    resolveAgentOnchainId(agentSlug, agentOnchainId),
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
  agentOnchainId,
}: RegisterAgentParams): Promise<string> {
  const execute = getExecuteFn(account);

  if (!execute) {
    throw new Error("Connected Starknet account is not available.");
  }

  const result = await execute([
    buildRegisterAgentCall(agentSlug, price, decimals, agentOnchainId),
  ]);
  return result.transaction_hash;
}

export async function hireAgentOnchain({
  account,
  agentSlug,
  agentOnchainId,
}: HireAgentParams): Promise<string> {
  const execute = getExecuteFn(account);

  if (!execute) {
    throw new Error("Connected Starknet account is not available.");
  }

  const readClient = account as unknown as StarknetReadClient;
  const price = await getAgentOnchainPrice(readClient, agentSlug, agentOnchainId);
  const creator = await getAgentCreatorOnchain(readClient, agentSlug, agentOnchainId);
  const result = await execute([
    buildHireAgentCall(agentSlug, creator, BigInt(price), agentOnchainId),
  ]);

  return result.transaction_hash;
}

export async function hasUserHiredAgentOnchain({
  provider,
  agentSlug,
  buyerAddress,
  agentOnchainId,
}: HasUserHiredParams): Promise<boolean> {
  const result = await readContract(provider, "has_user_hired", [
    resolveAgentOnchainId(agentSlug, agentOnchainId),
    buyerAddress,
  ]);

  return result[0] === "0x1" || result[0] === "1";
}

export async function getAgentOnchainPrice(
  provider: StarknetReadClient,
  agentSlug: string,
  agentOnchainId?: string,
): Promise<string> {
  const result = await readContract(provider, "get_agent_price", [
    resolveAgentOnchainId(agentSlug, agentOnchainId),
  ]);

  return decodeUint256(result).toString();
}

export async function getAgentOnchainStats(
  provider: StarknetReadClient,
  agentSlug: string,
  agentOnchainId?: string,
): Promise<OnchainAgentStats> {
  const [hiresResult, earningsResult] = await Promise.all([
    readContract(provider, "get_agent_total_hires", [
      resolveAgentOnchainId(agentSlug, agentOnchainId),
    ]),
    readContract(provider, "get_agent_total_earnings", [
      resolveAgentOnchainId(agentSlug, agentOnchainId),
    ]),
  ]);

  return {
    totalHires: decodeUint256(hiresResult).toString(),
    totalEarnings: decodeUint256(earningsResult).toString(),
  };
}

export async function getAgentCreatorOnchain(
  provider: StarknetReadClient,
  agentSlug: string,
  agentOnchainId?: string,
): Promise<string> {
  const result = await readContract(provider, "get_agent_creator", [
    resolveAgentOnchainId(agentSlug, agentOnchainId),
  ]);

  return result[0] ?? "";
}
