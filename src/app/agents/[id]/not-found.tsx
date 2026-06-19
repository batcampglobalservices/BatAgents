import Link from "next/link";

export default function AgentNotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-8 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Not found</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Agent not found</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          The agent you opened does not exist in Supabase or local storage yet.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/marketplace"
            className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Back to marketplace
          </Link>
          <Link
            href="/create-agent"
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:bg-white/10"
          >
            Create agent
          </Link>
        </div>
      </div>
    </section>
  );
}
