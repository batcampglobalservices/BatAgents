import type { HireRecord, UnlockedAgentRecord } from "@/types/payment";

const HIRES_STORAGE_KEY = "batagents.hires";
const UNLOCKED_AGENTS_STORAGE_KEY = "batagents.unlockedAgents";
const HIRES_CHANGE_EVENT = "batagents.hires-change";
const UNLOCKS_CHANGE_EVENT = "batagents.unlocked-agents-change";

function isBrowser() {
  return typeof window !== "undefined";
}

function readJson<T>(storageKey: string, fallback: T): T {
  if (!isBrowser()) {
    return fallback;
  }

  const value = window.localStorage.getItem(storageKey);

  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function writeJson(storageKey: string, value: unknown) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(value));
}

function emitChange(eventName: string) {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(eventName));
}

export function getStoredHiresSnapshot() {
  if (!isBrowser()) {
    return "[]";
  }

  return window.localStorage.getItem(HIRES_STORAGE_KEY) ?? "[]";
}

export function getStoredHires(): HireRecord[] {
  return readJson<HireRecord[]>(HIRES_STORAGE_KEY, []);
}

export function saveHireRecord(record: HireRecord) {
  const next = [record, ...getStoredHires()];
  writeJson(HIRES_STORAGE_KEY, next);
  emitChange(HIRES_CHANGE_EVENT);
}

export function subscribeHiresStore(onStoreChange: () => void) {
  if (!isBrowser()) {
    return () => {};
  }

  const handler = () => onStoreChange();
  window.addEventListener(HIRES_CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(HIRES_CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function getStoredUnlockedAgentsSnapshot() {
  if (!isBrowser()) {
    return "[]";
  }

  return window.localStorage.getItem(UNLOCKED_AGENTS_STORAGE_KEY) ?? "[]";
}

export function getStoredUnlockedAgents(): UnlockedAgentRecord[] {
  return readJson<UnlockedAgentRecord[]>(UNLOCKED_AGENTS_STORAGE_KEY, []);
}

export function isAgentUnlocked(agentId: string, buyerWallet: string) {
  return getStoredUnlockedAgents().some(
    (entry) =>
      entry.agentId === agentId &&
      entry.buyerWallet.toLowerCase() === buyerWallet.toLowerCase(),
  );
}

export function markAgentUnlocked(record: UnlockedAgentRecord) {
  const next = [record, ...getStoredUnlockedAgents()];
  writeJson(UNLOCKED_AGENTS_STORAGE_KEY, next);
  emitChange(UNLOCKS_CHANGE_EVENT);
}

export function subscribeUnlockedAgentsStore(onStoreChange: () => void) {
  if (!isBrowser()) {
    return () => {};
  }

  const handler = () => onStoreChange();
  window.addEventListener(UNLOCKS_CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(UNLOCKS_CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
