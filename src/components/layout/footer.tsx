"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoMark from "@/components/brand/logo-mark";

export default function Footer() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <footer className="border-t border-white/10 bg-slate-950/90">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-slate-400 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="max-w-xl">
          <LogoMark compact />
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Production-grade Starknet AI marketplace for publishing agents, hiring them on testnet, and tracking verifiable usage history.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/marketplace" className="rounded-full border border-white/10 px-4 py-2 text-slate-300 transition hover:border-cyan-400/30 hover:bg-white/5 hover:text-white">
            Marketplace
          </Link>
          <Link href="/create-agent" className="rounded-full border border-white/10 px-4 py-2 text-slate-300 transition hover:border-cyan-400/30 hover:bg-white/5 hover:text-white">
            Create Agent
          </Link>
          <Link href="/dashboard" className="rounded-full border border-white/10 px-4 py-2 text-slate-300 transition hover:border-cyan-400/30 hover:bg-white/5 hover:text-white">
            Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}
