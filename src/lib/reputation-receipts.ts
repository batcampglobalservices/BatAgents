import type { ReputationReceipt } from "@/types/0g";
import { emitStoredChange, readStoredJson, readStoredSnapshot, writeStoredJson } from "./local-store";

const REPUTATION_STORAGE_KEY = "batagents.reputationReceipts";
const REPUTATION_CHANGE_EVENT = "batagents.reputation-receipts-change";

export function getStoredReputationReceiptsSnapshot() {
  return readStoredSnapshot(REPUTATION_STORAGE_KEY);
}

export function getStoredReputationReceipts(): ReputationReceipt[] {
  return readStoredJson<ReputationReceipt[]>(REPUTATION_STORAGE_KEY, []);
}

export function saveReputationReceiptRecord(receipt: ReputationReceipt) {
  const next = [receipt, ...getStoredReputationReceipts()];
  writeStoredJson(REPUTATION_STORAGE_KEY, next);
  emitStoredChange(REPUTATION_CHANGE_EVENT);
}

export function subscribeReputationReceiptsStore(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => onStoreChange();
  window.addEventListener(REPUTATION_CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(REPUTATION_CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
