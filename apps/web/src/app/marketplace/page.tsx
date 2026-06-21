import { FilterBar } from "@/components/marketplace/FilterBar";
import { AgentGrid } from "@/components/marketplace/AgentGrid";
import { AgentCardProps } from "@/components/marketplace/AgentCard";

export default function MarketplacePage() {
  // Empty state by default — no fake listings
  const activeListings: AgentCardProps[] = [];

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 w-full">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Agent Marketplace
        </h1>
        <p className="text-white/50 text-sm max-w-xl">
          Purchase buyout, rental, or pay-per-message credits. All access rights are managed fully on-chain.
        </p>
      </div>

      {/* Controls & Grid */}
      <FilterBar />
      <AgentGrid agents={activeListings} />
    </main>
  );
}
