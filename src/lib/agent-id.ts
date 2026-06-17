const AGENT_ID_PREFIX = "batagents:";
const FELT_MASK = (BigInt(1) << BigInt(251)) - BigInt(1);

export function agentSlugToFelt(agentSlug: string): string {
  const normalizedSlug = agentSlug.trim().toLowerCase();
  const payload = `${AGENT_ID_PREFIX}${normalizedSlug}`;
  let hash = BigInt("0xcbf29ce484222325");

  for (let index = 0; index < payload.length; index += 1) {
    hash ^= BigInt(payload.charCodeAt(index));
    hash = (hash * BigInt("0x100000001b3")) & FELT_MASK;
  }

  return `0x${hash.toString(16)}`;
}

export function agentIdToFelt(agentIdOrSlug: string): string {
  const normalized = agentIdOrSlug.trim().toLowerCase();

  if (/^0x[0-9a-f]+$/i.test(normalized)) {
    return normalized;
  }

  return agentSlugToFelt(normalized);
}
