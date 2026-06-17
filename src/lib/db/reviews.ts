import type { StoredReview } from "@/lib/reviews";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { saveReviewRecord } from "@/lib/reviews";

async function getSupabaseClient() {
  const { getSupabaseServerClient } = await import("@/lib/supabase/server");

  return (
    getSupabaseBrowserClient() ??
    (await getSupabaseServerClient()) ??
    getSupabaseAdminClient()
  );
}

export async function createReviewRecord(review: StoredReview) {
  const client = await getSupabaseClient();

  if (client) {
    await client.from("reviews").upsert({
      id: review.id,
      agent_id: review.agentId,
      buyer_wallet: review.buyerWallet,
      rating: review.rating,
      review: review.comment,
      created_at: review.createdAt,
    });
  }

  saveReviewRecord(review);
  return review;
}

export async function createReview(review: StoredReview) {
  return createReviewRecord(review);
}
