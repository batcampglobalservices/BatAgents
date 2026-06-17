import type { Metadata } from "next";
import AgentRouteView from "@/components/agents/agent-route-view";
import { getAgentBySlug } from "@/lib/db/agents";

type AgentChatPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: AgentChatPageProps): Promise<Metadata> {
  const { id } = await params;
  const agent = await getAgentBySlug(id);

  return {
    title: agent ? `${agent.name} Chat` : "Agent Chat",
    description:
      "Starknet Sepolia payment unlock and real AI chat workspace for BatAgents.",
  };
}

export default async function AgentChatPage({ params }: AgentChatPageProps) {
  const { id } = await params;
  const agent = await getAgentBySlug(id);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-6 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
          Chat workspace
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Hire, pay, and chat in one place.
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-300">
          Pay on Starknet Sepolia testnet to unlock the selected agent, then chat with
          the real AI worker backed by Groq and Vercel AI SDK.
        </p>
      </div>

      <AgentRouteView agentId={id} mode="chat" initialAgent={agent ?? null} />
    </section>
  );
}
