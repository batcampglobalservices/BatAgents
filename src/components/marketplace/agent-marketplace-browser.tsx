"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import type { Agent } from "@/types/agent";
import AgentCard from "@/components/agents/agent-card";
import StatusBadge from "@/components/ui/status-badge";
import {
  getStoredCreatedAgentsSnapshot,
  mergePublishedAgents,
  subscribeCreatedAgentsStore,
} from "@/lib/created-agents";

type AgentMarketplaceBrowserProps = {
  staticAgents: Agent[];
};

type SortKey = "newest" | "rating" | "price";

export default function AgentMarketplaceBrowser({
  staticAgents,
}: AgentMarketplaceBrowserProps) {
  const createdAgentsSnapshot = useSyncExternalStore(
    subscribeCreatedAgentsStore,
    getStoredCreatedAgentsSnapshot,
    () => "[]",
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [onchainOnly, setOnchainOnly] = useState(false);
  const [proofOnly, setProofOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("newest");

  const agents = useMemo(
    () => mergePublishedAgents(staticAgents),
    [staticAgents, createdAgentsSnapshot],
  );

  const categories = useMemo(
    () => ["All", ...new Set(agents.map((agent) => agent.category))],
    [agents],
  );

  const filteredAgents = useMemo(() => {
    const search = query.trim().toLowerCase();

    return [...agents]
      .filter((agent) => {
        const matchesQuery =
          !search ||
          [agent.name, agent.service, agent.description, agent.creator]
            .join(" ")
            .toLowerCase()
            .includes(search);
        const matchesCategory = category === "All" || agent.category === category;
        const matchesOnchain =
          !onchainOnly || Boolean(agent.onchainRegistrationTxHash);
        const matchesProof = !proofOnly || Boolean(agent.zeroGProof);
        return matchesQuery && matchesCategory && matchesOnchain && matchesProof;
      })
      .sort((left, right) => {
        if (sortBy === "rating") {
          return right.rating - left.rating;
        }

        if (sortBy === "price") {
          return left.price - right.price;
        }

        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      });
  }, [agents, category, onchainOnly, proofOnly, query, sortBy]);

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Marketplace</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Choose an agent by task, proof, and access state.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Search published AI agents, narrow by proof state, and open the ones ready for onchain hiring.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="cyan">Supabase records</StatusBadge>
            <StatusBadge tone="emerald">0G proofs</StatusBadge>
            <StatusBadge tone="violet">Starknet Sepolia</StatusBadge>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1.1fr_auto_auto_auto_auto]">
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search agents, creators, or services"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </label>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
          >
            {categories.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setOnchainOnly((value) => !value)}
            className={`rounded-2xl border px-4 py-3 text-sm transition ${
              onchainOnly
                ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-100"
                : "border-white/10 bg-slate-950/60 text-slate-300"
            }`}
          >
            Onchain only
          </button>

          <button
            type="button"
            onClick={() => setProofOnly((value) => !value)}
            className={`rounded-2xl border px-4 py-3 text-sm transition ${
              proofOnly
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
                : "border-white/10 bg-slate-950/60 text-slate-300"
            }`}
          >
            0G proof only
          </button>

          <button
            type="button"
            onClick={() =>
              setSortBy((value) =>
                value === "newest" ? "rating" : value === "rating" ? "price" : "newest",
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300"
          >
            <ArrowUpDown className="h-4 w-4" />
            {sortBy}
          </button>
        </div>
      </section>

      {filteredAgents.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.slug} agent={agent} />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-slate-950/40 p-8 text-center">
          <h3 className="text-lg font-semibold text-white">No agents found</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Try a broader search or clear the proof and onchain filters.
          </p>
        </div>
      )}
    </div>
  );
}
