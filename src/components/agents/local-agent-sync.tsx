"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  getStoredCreatedAgentsSnapshot,
  getStoredCreatedAgents,
  subscribeCreatedAgentsStore,
} from "@/lib/created-agents";

const SYNC_FINGERPRINT_KEY = "batagents.syncedCreatedAgentsFingerprint";

export default function LocalAgentSync() {
  const router = useRouter();
  const createdAgentsSnapshot = useSyncExternalStore(
    subscribeCreatedAgentsStore,
    getStoredCreatedAgentsSnapshot,
    () => "[]",
  );
  const fingerprint = useMemo(() => {
    const agents = [...getStoredCreatedAgents()].sort((left, right) =>
      left.id.localeCompare(right.id),
    );

    return agents
      .map((agent) =>
        [
          agent.id,
          agent.slug,
          agent.name,
          agent.status ?? "",
          agent.createdAt,
          agent.publishedAt,
          agent.onchainRegistrationTxHash ?? "",
          agent.zeroGProof?.rootHash ?? "",
        ].join("|"),
      )
      .join("::");
  }, [createdAgentsSnapshot]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const agents = getStoredCreatedAgents();
      if (agents.length === 0) {
        return;
      }

      const previousFingerprint = window.localStorage.getItem(SYNC_FINGERPRINT_KEY);

      if (previousFingerprint === fingerprint) {
        return;
      }

      const { data } = await supabase.auth.getUser();
      const creatorId = data.user?.id ?? null;

      if (cancelled) {
        return;
      }

      const response = await fetch("/api/agents/sync-local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agents,
          creatorId,
        }),
      });

      if (!response.ok) {
        return;
      }

      if (cancelled) {
        return;
      }

      window.localStorage.setItem(SYNC_FINGERPRINT_KEY, fingerprint);
      router.refresh();
    })();

    return () => {
      cancelled = true;
    };
  }, [fingerprint, router]);

  return null;
}
