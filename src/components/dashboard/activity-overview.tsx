"use client";

import { useSyncExternalStore } from "react";
import { BadgeCheck, Bot, FileCheck2, MessageSquareText } from "lucide-react";
import { getStoredCreatedAgentsSnapshot, subscribeCreatedAgentsStore } from "@/lib/created-agents";
import { getStoredTaskProofsSnapshot, subscribeTaskProofsStore } from "@/lib/task-proofs";
import { getStoredReviewsSnapshot, subscribeReviewsStore } from "@/lib/reviews";
import {
  getStoredReputationReceiptsSnapshot,
  subscribeReputationReceiptsStore,
} from "@/lib/reputation-receipts";

type ActivityOverviewProps = {
  title?: string;
};

export default function ActivityOverview({ title = "Live activity" }: ActivityOverviewProps) {
  const createdSnapshot = useSyncExternalStore(
    subscribeCreatedAgentsStore,
    getStoredCreatedAgentsSnapshot,
    () => "[]",
  );
  const proofsSnapshot = useSyncExternalStore(
    subscribeTaskProofsStore,
    getStoredTaskProofsSnapshot,
    () => "[]",
  );
  const reviewsSnapshot = useSyncExternalStore(
    subscribeReviewsStore,
    getStoredReviewsSnapshot,
    () => "[]",
  );
  const receiptsSnapshot = useSyncExternalStore(
    subscribeReputationReceiptsStore,
    getStoredReputationReceiptsSnapshot,
    () => "[]",
  );

  const metrics = [
    { label: "Created agents", value: safeCount(createdSnapshot), icon: Bot },
    { label: "Task proofs", value: safeCount(proofsSnapshot), icon: FileCheck2 },
    { label: "Reviews", value: safeCount(reviewsSnapshot), icon: MessageSquareText },
    { label: "Reputation receipts", value: safeCount(receiptsSnapshot), icon: BadgeCheck },
  ];

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">{title}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
              <Icon className="h-5 w-5 text-cyan-300" />
              <p className="mt-4 text-sm text-slate-400">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{metric.value}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function safeCount(value: string) {
  try {
    return JSON.parse(value).length as number;
  } catch {
    return 0;
  }
}
