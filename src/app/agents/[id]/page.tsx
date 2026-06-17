import type { Metadata } from "next";
import Link from "next/link";
import AgentRouteView from "@/components/agents/agent-route-view";
import { getAgentBySlug } from "@/lib/db/agents";

type AgentPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: AgentPageProps): Promise<Metadata> {
  const { id } = await params;
  const agent = await getAgentBySlug(id);

  if (!agent) {
    return {
      title: "Agent not found",
    };
  }

  return {
    title: agent.name,
    description: agent.description,
  };
}

export default async function AgentPage({ params }: AgentPageProps) {
  const { id } = await params;
  const agent = await getAgentBySlug(id);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link href="/marketplace" className="text-sm text-cyan-300 transition hover:text-cyan-200">
          Back to marketplace
        </Link>
        <Link
          href={`/agents/${agent?.slug ?? id}/chat`}
          className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Hire Agent
        </Link>
      </div>

      <AgentRouteView agentId={id} mode="profile" initialAgent={agent ?? null} />
    </section>
  );
}
