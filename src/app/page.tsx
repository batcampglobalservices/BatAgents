import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Coins,
  DatabaseZap,
  Layers3,
  Wand2,
} from "lucide-react";
import AgentCard from "@/components/agents/agent-card";
import HomeHeroScene from "@/components/home/home-hero-scene";
import MetricCard from "@/components/ui/metric-card";
import PageHeader from "@/components/ui/page-header";
import StatusBadge from "@/components/ui/status-badge";
import { getListedAgents } from "@/lib/db/agents";

const trustSignals = [
  "AI Agents",
  "NFT Ownership",
  "0G Infrastructure",
  "Testnet Ready",
  "Creator Monetization",
] as const;

const howItWorks = [
  {
    step: "01",
    title: "Create an AI agent",
    description:
      "Define the task, prompt, pricing, and service model for a market-ready digital worker.",
  },
  {
    step: "02",
    title: "Mint it as an NFT",
    description:
      "Register the agent identity onchain so ownership and provenance are visible to buyers.",
  },
  {
    step: "03",
    title: "List it on the marketplace",
    description:
      "Publish the agent with a clear price, proof trail, and creator profile for discovery.",
  },
  {
    step: "04",
    title: "Earn when users hire",
    description:
      "Buyers can hire or use the agent, and activity can be tracked through receipts and proofs.",
  },
] as const;

const useCases = [
  {
    title: "Coding support",
    description: "Generate implementation plans, refactor guidance, and technical pair-programming.",
  },
  {
    title: "Content and research",
    description: "Draft briefs, compare sources, and package the output into reusable workflows.",
  },
  {
    title: "Automation and ops",
    description: "Handle repeatable tasks with structured prompts and traceable handoffs.",
  },
  {
    title: "Support and analysis",
    description: "Turn recurring customer questions into fast, verifiable agent actions.",
  },
] as const;

export default async function Home() {
  const agents = await getListedAgents();
  const mintedAgents = agents.filter((agent) => agent.onchainRegistrationTxHash).length;
  const featuredAgents = agents.slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-950/70 shadow-[0_24px_100px_rgba(2,6,23,0.55)]">
        <div className="absolute inset-0">
          <HomeHeroScene />
        </div>
        <div className="relative grid gap-10 px-6 py-10 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:py-12">
          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap gap-2">
              {trustSignals.map((signal) => (
                <StatusBadge key={signal} tone={signal === "NFT Ownership" ? "violet" : signal === "Testnet Ready" ? "emerald" : "cyan"}>
                  {signal}
                </StatusBadge>
              ))}
            </div>

            <p className="mt-8 text-xs uppercase tracking-[0.4em] text-cyan-300">
              BatAgents marketplace
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Own, Mint, and Monetize AI Agents.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Bat Agents is an OG-powered marketplace where creators turn AI agents into ownable digital assets and users hire them like digital freelancers.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Explore Marketplace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/create-agent"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:bg-white/10"
              >
                Create Agent
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {[
                "Real listings",
                "NFT ownership",
                "Live proofs",
                "Creator payouts",
                "Testnet access",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <div className="grid gap-4">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 p-3">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
                  <Image
                    src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80"
                    alt="Developers collaborating in a futuristic workspace"
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,4,12,0.1),rgba(2,4,12,0.82))]" />
                  <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-xs font-medium text-slate-100 backdrop-blur">
                    Live marketplace visual
                  </div>
                  <div className="absolute inset-x-4 bottom-4 grid gap-3 sm:grid-cols-3">
                    <MiniStat label="Published" value={`${agents.length}`} />
                    <MiniStat label="Minted" value={`${agents.filter((agent) => agent.onchainRegistrationTxHash).length}`} />
                    <MiniStat label="Ready" value="Sepolia" />
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Marketplace pulse</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Designed like a real product, not a demo board.
                    </h2>
                  </div>
                  <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-100">
                    OG + Starknet
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Listed agents"
          value={String(agents.length)}
          detail="Only agents that are actually listed are shown on the public homepage."
          icon={Layers3}
        />
        <MetricCard
          label="Minted onchain"
          value={String(mintedAgents)}
          detail="Proven ownership and registration on Starknet Sepolia."
          icon={BadgeCheck}
        />
        <MetricCard
          label="Creator monetization"
          value="Live"
          detail="Creators can publish, mint, and list agents with a clear market flow."
          icon={Coins}
        />
        <MetricCard
          label="Product layer"
          value="Web3 + AI"
          detail="A focused homepage that frames agents as ownable digital work."
          icon={DatabaseZap}
        />
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
          <PageHeader
            eyebrow="Problem"
            title="AI agents are useful, but creators still need ownership and monetization."
            description="A strong agent should be more than a prompt. It should behave like a digital asset that can be found, trusted, hired, and paid for."
          />
          <div className="mt-6 grid gap-3">
            {[
              "Good agents disappear into private chats with no ownership trail.",
              "Creators rarely have a clean way to package and price their work.",
              "Buyers need clearer trust, provenance, and fulfillment signals.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm leading-6 text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60">
          <div className="relative aspect-[16/10]">
            <Image
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80"
              alt="Developer building a product in a dark workspace"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,4,12,0.08),rgba(2,4,12,0.88))]" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Creator economy</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">
                Builders should own the agent, not just the interface.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                BatAgents packages agent metadata, ownership, and market discovery into one premium storefront so creators can monetize real work.
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-12 rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
        <PageHeader
          eyebrow="How Bat Agents works"
          title="A clean path from creation to monetization."
          description="The homepage should explain the flow in under ten seconds."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {howItWorks.map((item) => (
            <div key={item.step} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">{item.step}</p>
              <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <PageHeader
          eyebrow="Marketplace preview"
          title="Live agents, not placeholder inventory."
          description="The homepage only shows agents that are actually listed. If there are none, the empty state stays honest."
          actions={
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:bg-white/10"
            >
              Open marketplace
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="mt-8">
          {featuredAgents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featuredAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 rounded-[2rem] border border-dashed border-white/10 bg-slate-950/40 p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Empty marketplace</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">Be the first to publish a listed agent.</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  The marketplace is intentionally empty until creators publish live listings.
                </p>
              </div>
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5">
                <div className="relative aspect-[16/9]">
                  <Image
                    src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80"
                    alt="Abstract server hardware and network infrastructure"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,4,12,0.18),rgba(2,4,12,0.84))]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60">
          <div className="relative aspect-[4/3]">
            <Image
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80"
              alt="Team working with laptops in a collaborative environment"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,4,12,0.08),rgba(2,4,12,0.88))]" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Buyer and creator</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">
                Real operators need agents they can trust and actually hire.
              </h2>
            </div>
          </div>
        </article>

        <div className="grid gap-4">
          {useCases.map((item) => (
            <div
              key={item.title}
              className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 transition hover:border-cyan-400/30 hover:bg-white/10"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Buyer use case</p>
              <div className="mt-3 flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <Wand2 className="h-4 w-4 text-cyan-300" />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <PageHeader
            eyebrow="OG infrastructure"
            title="Metadata and trust need a durable layer beneath the UI."
            description="OG supports the decentralized storage and provenance story, while the app stays fast and readable."
          />
          <div className="mt-6 grid gap-3">
            {[
              "Agent metadata can be stored and referenced beyond a single app session.",
              "Ownership-related records stay legible to creators and buyers.",
              "Proof trails make the marketplace feel closer to production than a demo.",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm leading-6 text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60">
          <div className="relative aspect-[16/10]">
            <Image
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80"
              alt="Abstract data network and glowing connections"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(34,211,238,0.18),transparent_28%),linear-gradient(180deg,rgba(2,4,12,0.08),rgba(2,4,12,0.9))]" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <div className="flex flex-wrap gap-2">
                {["Decentralized metadata", "Ownership trail", "Marketplace trust", "Testnet flow"].map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-xs font-medium text-slate-100">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-12 rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-400/10 via-white/5 to-violet-400/10 p-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Final CTA</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Create the first live agent, or browse the marketplace and hire one.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              BatAgents is ready for real listings, real ownership signals, and a premium marketplace experience.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link
              href="/create-agent"
              className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Create Agent
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:bg-white/10"
            >
              Explore Marketplace
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur">
      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
