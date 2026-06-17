import { emitStoredChange, readStoredJson, readStoredSnapshot, writeStoredJson } from "./local-store";

export type StoredReview = {
  id: string;
  agentId: string;
  agentName: string;
  buyerWallet: string;
  rating: number;
  comment: string;
  createdAt: string;
};

const REVIEWS_STORAGE_KEY = "batagents.reviews";
const REVIEWS_CHANGE_EVENT = "batagents.reviews-change";

export function getStoredReviewsSnapshot() {
  return readStoredSnapshot(REVIEWS_STORAGE_KEY);
}

export function getStoredReviews(): StoredReview[] {
  return readStoredJson<StoredReview[]>(REVIEWS_STORAGE_KEY, []);
}

export function saveReviewRecord(review: StoredReview) {
  const next = [review, ...getStoredReviews()];
  writeStoredJson(REVIEWS_STORAGE_KEY, next);
  emitStoredChange(REVIEWS_CHANGE_EVENT);
}

export function subscribeReviewsStore(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => onStoreChange();
  window.addEventListener(REVIEWS_CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(REVIEWS_CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
