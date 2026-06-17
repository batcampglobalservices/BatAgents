import type { TaskProof } from "@/types/0g";
import { emitStoredChange, readStoredJson, readStoredSnapshot, writeStoredJson } from "./local-store";

const TASK_PROOFS_STORAGE_KEY = "batagents.taskProofs";
const TASK_PROOFS_CHANGE_EVENT = "batagents.task-proofs-change";

export function getStoredTaskProofsSnapshot() {
  return readStoredSnapshot(TASK_PROOFS_STORAGE_KEY);
}

export function getStoredTaskProofs(): TaskProof[] {
  return readStoredJson<TaskProof[]>(TASK_PROOFS_STORAGE_KEY, []);
}

export function saveTaskProofRecord(proof: TaskProof) {
  const next = [proof, ...getStoredTaskProofs()];
  writeStoredJson(TASK_PROOFS_STORAGE_KEY, next);
  emitStoredChange(TASK_PROOFS_CHANGE_EVENT);
}

export function subscribeTaskProofsStore(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => onStoreChange();
  window.addEventListener(TASK_PROOFS_CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(TASK_PROOFS_CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
