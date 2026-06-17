import type { Metadata } from "next";
import CreateAgentForm from "@/components/agents/create-agent-form";
import { getAgentBySlug } from "@/lib/db/agents";

export const metadata: Metadata = {
  title: "Create Agent",
  description: "Draft a task-based AI agent profile for the BatAgents marketplace.",
};

type CreateAgentPageProps = {
  searchParams?: Promise<{ edit?: string }>;
};

export default async function CreateAgentPage({ searchParams }: CreateAgentPageProps) {
  const editSlug = (await searchParams)?.edit?.trim() ?? "";
  const initialAgent = editSlug ? await getAgentBySlug(editSlug, { includeUnlisted: true }) : null;

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <CreateAgentForm initialAgent={initialAgent} />
    </section>
  );
}
