import { CreateAgentForm } from "@/components/create/CreateAgentForm";

export default function CreatePage() {
  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 w-full">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Create AI Agent
        </h1>
        <p className="text-white/50 text-sm">
          Define instructions, configure access tier parameters, and register your Agentic ID on-chain.
        </p>
      </div>

      {/* Form Container */}
      <CreateAgentForm />
    </main>
  );
}
