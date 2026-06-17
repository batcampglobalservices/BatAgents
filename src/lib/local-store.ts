const isBrowser = () => typeof window !== "undefined";

export function readStoredJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);

  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStoredJson(key: string, value: unknown) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function readStoredSnapshot(key: string) {
  if (!isBrowser()) {
    return "[]";
  }

  return window.localStorage.getItem(key) ?? "[]";
}

export function emitStoredChange(eventName: string) {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(eventName));
}
