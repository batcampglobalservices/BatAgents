import type { Metadata } from "next";
import CreateAgentForm from "@/components/agents/create-agent-form";

export const metadata: Metadata = {
  title: "Create Agent",
  description: "Draft a task-based AI agent profile for the BatAgents marketplace.",
};

export default function CreateAgentPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <CreateAgentForm />
    </section>
  );
}
