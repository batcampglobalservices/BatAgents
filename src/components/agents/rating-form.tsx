"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import type { Agent } from "@/types/agent";
import { uploadReputationReceiptTo0G } from "@/lib/0g";
import { createReviewRecord } from "@/lib/db/reviews";
import { createReputationReceiptRecord } from "@/lib/db/proofs";
import ProofCard from "@/components/0g/proof-card";

type RatingFormProps = {
  agent: Agent;
};

export default function RatingForm({ agent }: RatingFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [proofState, setProofState] = useState<"idle" | "saving" | "saved">("idle");
  const [proof, setProof] = useState<{
    rootHash: string;
    txHash?: string;
    url?: string;
    storedAt: string;
    mode?: "demo" | "real";
  } | null>(null);

  return (
      <form
      className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
      onSubmit={(event) => {
        event.preventDefault();
        const createdAt = new Date().toISOString();
        const reviewId = `review_${agent.id}_${Date.now()}`;
        const receiptId = `receipt_${agent.id}_${Date.now()}`;

        void (async () => {
          await createReviewRecord({
          id: reviewId,
          agentId: agent.id,
          agentName: agent.name,
          buyerWallet: "0x0g_demo_buyer_001",
          rating,
          comment,
          createdAt,
          });
          setProofState("saving");
          const result = await uploadReputationReceiptTo0G({
            id: receiptId,
            agentId: agent.id,
            rating,
            review: comment || `Rated ${agent.name} ${rating} stars.`,
            reviewerWallet: "0x0g_demo_buyer_001",
            proofRootHash: `0x0g_rep_${agent.id}_${Date.now().toString(16)}`,
            createdAt,
          });

          await createReputationReceiptRecord({
            id: receiptId,
            agentId: agent.id,
            rating,
            review: comment || `Rated ${agent.name} ${rating} stars.`,
            reviewerWallet: "0x0g_demo_buyer_001",
            proofRootHash: result.rootHash,
            createdAt,
          }, result);
          setProof({
            rootHash: result.rootHash,
            txHash: result.txHash,
            url: result.url,
            storedAt: result.storedAt,
            mode: result.mode,
          });
          setProofState("saved");
          setSubmitted(true);
        })();
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Review</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Rate the agent</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
          Buyer feedback
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
              value <= rating
                ? "border-amber-400/40 bg-amber-400/10 text-amber-100"
                : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white"
            }`}
          >
            <Star className="h-4 w-4 fill-current" />
            {value}
          </button>
        ))}
      </div>

      <label className="mt-6 grid gap-2 text-sm font-medium text-slate-200">
        <span>Comment</span>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={4}
          placeholder="What did the agent do well?"
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
        />
      </label>

      {submitted ? (
        <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100">
          Thanks for the feedback. The review and reputation receipt are saved.
        </div>
      ) : null}

      <button
        type="submit"
        className="mt-6 inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
      >
        Submit rating
      </button>

      {proof ? (
        <div className="mt-6">
          <ProofCard
            proofType="Reputation Receipt"
            proof={proof}
            status={proofState === "saved" ? "stored" : "mock"}
          />
        </div>
      ) : null}
    </form>
  );
}
