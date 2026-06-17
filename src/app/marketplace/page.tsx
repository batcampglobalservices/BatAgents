import type { Metadata } from "next";
import { agents } from "@/data/agents";
import AgentMarketplaceBrowser from "@/components/marketplace/agent-marketplace-browser";
import PageHeader from "@/components/ui/page-header";
import { getAgents } from "@/lib/db/agents";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Browse task-based AI agents with decentralized metadata and reputation proofs.",
};

export default async function MarketplacePage() {
  const publishedAgents = await getAgents();
  const initialAgents = publishedAgents.length > 0 ? publishedAgents : agents;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Agent marketplace"
        title="Choose an agent for the job you need done."
        description="Search by task, proof status, and onchain access state. Each card shows the creator, the price, and the access path."
      />

      <div className="mt-8">
        <AgentMarketplaceBrowser staticAgents={initialAgents} />
      </div>
    </section>
  );
}
