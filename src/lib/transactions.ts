import type { PaymentTransactionRecord } from "@/types/payment";

const TRANSACTIONS_STORAGE_KEY = "batagents.transactions";
const TRANSACTIONS_CHANGE_EVENT = "batagents.transactions-change";

function isBrowser() {
  return typeof window !== "undefined";
}

function readJson<T>(fallback: T): T {
  if (!isBrowser()) {
    return fallback;
  }

  const value = window.localStorage.getItem(TRANSACTIONS_STORAGE_KEY);

  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function writeJson(value: unknown) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(value));
}

function emitChange() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(TRANSACTIONS_CHANGE_EVENT));
}

export function getStoredTransactionsSnapshot() {
  if (!isBrowser()) {
    return "[]";
  }

  return window.localStorage.getItem(TRANSACTIONS_STORAGE_KEY) ?? "[]";
}

export function getStoredTransactions(): PaymentTransactionRecord[] {
  return readJson<PaymentTransactionRecord[]>([]);
}

export function savePaymentTransactionRecord(record: PaymentTransactionRecord) {
  const next = [record, ...getStoredTransactions()];
  writeJson(next);
  emitChange();
}

export function subscribeTransactionsStore(onStoreChange: () => void) {
  if (!isBrowser()) {
    return () => {};
  }

  const handler = () => onStoreChange();
  window.addEventListener(TRANSACTIONS_CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(TRANSACTIONS_CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
