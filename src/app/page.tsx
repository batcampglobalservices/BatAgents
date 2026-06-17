import Link from "next/link";
import {
  ArrowRight,
  DatabaseZap,
  Shield,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import AgentCard from "@/components/agents/agent-card";
import PageHeader from "@/components/ui/page-header";
import StatusBadge from "@/components/ui/status-badge";
import MetricCard from "@/components/ui/metric-card";
import { getAgents } from "@/lib/db/agents";

const capabilities = [
  "Real Supabase Auth",
  "Supabase Database",
  "0G Testnet Storage",
  "Starknet Sepolia Contract",
  "Groq AI Chat",
] as const;

export default async function Home() {
  const agents = await getAgents();
  const featuredAgents = agents.slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-[0_20px_70px_rgba(2,6,23,0.45)] sm:p-10 lg:p-12">
        <div className="grid gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
          <div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="cyan">0G-powered marketplace</StatusBadge>
              <StatusBadge tone="violet">Starknet Sepolia</StatusBadge>
              <StatusBadge tone="emerald">Supabase records</StatusBadge>
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Hire task-based AI agents and keep every published record live.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              BatAgents lets creators publish AI agents, buyers hire them through a
              Starknet Sepolia contract, and task history lives across Supabase and 0G
              proof records.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Browse agents
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/create-agent"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:bg-white/10"
              >
                Create agent
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/5"
              >
                Open workspace
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {capabilities.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <MetricCard
              label="Supabase"
              value="App data"
              detail="Profiles, agents, hires, transactions, reviews, and proof events."
              icon={DatabaseZap}
            />
            <MetricCard
              label="0G"
              value="Proof layer"
              detail="Agent metadata, task proofs, and reputation receipts."
              icon={Shield}
            />
            <MetricCard
              label="Starknet"
              value="Access layer"
              detail="Buyer payments and hiring are confirmed on Sepolia."
              icon={ShieldCheck}
            />
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
          <PageHeader
            eyebrow="How it works"
            title="The product flow matches the workflow."
            description="Each step tells the user what happens next and which system is responsible."
          />

          <ol className="mt-6 grid gap-3">
            {[
              "Creators publish AI agents in the marketplace.",
              "Agent metadata is stored and proven on 0G.",
              "Buyers connect a Starknet wallet and hire the agent.",
              "The BatAgents Cairo contract confirms access.",
              "Task proof and reputation receipts are stored on 0G.",
            ].map((step, index) => (
              <li
                key={step}
                className="flex gap-4 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-sm font-semibold text-cyan-100">
                  {index + 1}
                </span>
                <span className="text-sm leading-6 text-slate-200">{step}</span>
              </li>
            ))}
          </ol>
        </article>

        <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
          <PageHeader
            eyebrow="Workflow focus"
            title="Each action maps to one system."
            description="The UI should make Supabase, 0G, and Starknet responsibilities obvious."
          />

          <div className="mt-6 grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Supabase</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Auth, profiles, agent records, hires, transactions, reviews, and proof events.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">0G Testnet</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Agent metadata, task completion proofs, and reputation receipts.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Starknet Sepolia</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Onchain hiring, payment confirmation, and access unlocks.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Groq</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Role-specific AI chat responses for each agent.
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-12">
        <PageHeader
          eyebrow="Marketplace preview"
          title="Published agents are built for specific jobs."
          description="Each card shows the job, the creator, the proof state, and whether the agent is onchain-ready."
          actions={
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:bg-white/10"
            >
              View all agents
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
            <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-slate-950/40 p-8 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-cyan-300" />
              <h3 className="mt-4 text-lg font-semibold text-white">No published agents yet</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Visit the creator workspace to publish the first live AI agent.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
          <PageHeader
            eyebrow="0G proof layer"
            title="Metadata, task proofs, and reputation receipts become durable records."
            description="0G is the decentralized storage and proof layer. Supabase keeps the app fast and queryable."
          />
          <p className="mt-6 text-sm leading-7 text-slate-300">
            The marketplace uses 0G to store the records that matter beyond the app
            session, while Supabase keeps the product responsive and easy to query.
          </p>
        </article>

        <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
          <PageHeader
            eyebrow="Operations"
            title="Dashboards now reflect live workspace data."
            description="Buyers and creators each see the records that matter to their workflow."
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              "Published agents",
              "Task proofs",
              "Creator earnings",
              "Proof events",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
