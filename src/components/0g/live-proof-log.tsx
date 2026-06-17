"use client";

import { useSyncExternalStore } from "react";
import ProofCard from "./proof-card";
import {
  getStoredTaskProofsSnapshot,
  subscribeTaskProofsStore,
} from "@/lib/task-proofs";
import {
  getStoredReputationReceiptsSnapshot,
  subscribeReputationReceiptsStore,
} from "@/lib/reputation-receipts";
import { buildReputationReceipt, buildTaskProof } from "@/lib/0g";
import { getStoredTaskProofs } from "@/lib/task-proofs";
import { getStoredReputationReceipts } from "@/lib/reputation-receipts";

type LiveProofLogProps = {
  title?: string;
};

export default function LiveProofLog({ title = "Live proof log" }: LiveProofLogProps) {
  useSyncExternalStore(subscribeTaskProofsStore, getStoredTaskProofsSnapshot, () => "[]");
  useSyncExternalStore(
    subscribeReputationReceiptsStore,
    getStoredReputationReceiptsSnapshot,
    () => "[]",
  );

  const tasks = getStoredTaskProofs();
  const reputations = getStoredReputationReceipts();

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">{title}</p>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <div className="space-y-4">
          {tasks.length > 0 ? (
            tasks.slice(0, 2).map((task) => (
              <ProofCard
                key={task.id}
                proofType="Task Proof"
                proof={buildTaskProof(task)}
                status="stored"
              />
            ))
          ) : (
            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 text-sm text-slate-300">
              No task proofs saved yet.
            </div>
          )}
        </div>

        <div className="space-y-4">
          {reputations.length > 0 ? (
            reputations.slice(0, 2).map((receipt) => (
              <ProofCard
                key={receipt.id}
                proofType="Reputation Receipt"
                proof={buildReputationReceipt(receipt)}
                status="stored"
              />
            ))
          ) : (
            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 text-sm text-slate-300">
              No reputation receipts saved yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
