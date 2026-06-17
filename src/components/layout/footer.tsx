import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p>BatAgents turns AI agents into services you can hire onchain.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/marketplace" className="transition hover:text-white">
            Marketplace
          </Link>
          <Link href="/create-agent" className="transition hover:text-white">
            Create Agent
          </Link>
          <Link href="/dashboard" className="transition hover:text-white">
            Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}
