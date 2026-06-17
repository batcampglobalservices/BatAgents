import Link from "next/link";

export default function AgentNotFound() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Not found</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
        This agent does not exist.
      </h1>
      <p className="mt-4 text-lg leading-8 text-slate-300">
        The selected agent could not be found in the current dummy data set.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/marketplace"
          className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Back to marketplace
        </Link>
      </div>
    </section>
  );
}
