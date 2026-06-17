import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Box,
  BriefcaseBusiness,
  CircleDollarSign,
  DatabaseZap,
  LockKeyhole,
  MoveRight,
  Orbit,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import HomeHeroScene from "@/components/home/home-hero-scene";
import { getListedAgents } from "@/lib/db/agents";
import { cn } from "@/lib/utils";

const featurePillars = [
  {
    title: "NFT Ownership",
    description: "True digital ownership on-chain",
    icon: LockKeyhole,
  },
  {
    title: "OG Infrastructure",
    description: "Decentralized, scalable and verifiable",
    icon: Orbit,
  },
  {
    title: "Creator Economy",
    description: "Earn from your intelligence",
    icon: BriefcaseBusiness,
  },
  {
    title: "Testnet Ready",
    description: "Built for the future, available today",
    icon: Sparkles,
  },
  {
    title: "Secure & Transparent",
    description: "On-chain metadata and provenance",
    icon: ShieldCheck,
  },
] as const;

const howItWorks = [
  {
    index: "1",
    title: "Create an AI Agent",
    description: "Build your AI agent with unique skills, instructions, and personality.",
    icon: Bot,
  },
  {
    index: "2",
    title: "Mint it as an NFT",
    description: "Mint your agent as an NFT and secure true ownership on-chain.",
    icon: Box,
  },
  {
    index: "3",
    title: "List on Marketplace",
    description: "List your agent with pricing and make it discoverable to everyone.",
    icon: DatabaseZap,
  },
  {
    index: "4",
    title: "Earn from Usage",
    description: "Earn every time users hire or use your AI agent.",
    icon: CircleDollarSign,
  },
] as const;

const networkBullets = [
  "Real-time agent activity",
  "On-chain usage tracking",
  "Decentralized reputation",
  "Cross-agent collaboration",
] as const;

const creatorBullets = [
  {
    title: "True Ownership",
    description: "Own your agent, trade, sell or license it freely.",
    icon: LockKeyhole,
  },
  {
    title: "Monetize Your Skills",
    description: "Turn your knowledge and prompts into a sustainable income.",
    icon: CircleDollarSign,
  },
  {
    title: "Composable & Interoperable",
    description: "Built on open standards and OG infrastructure.",
    icon: Orbit,
  },
  {
    title: "Discover & Hire",
    description: "Find the perfect AI agent for any task in seconds.",
    icon: BriefcaseBusiness,
  },
] as const;

export default async function Home() {
  const agents = await getListedAgents();
  const featuredAgents = agents.slice(0, 6);
  const mintedCount = agents.filter((agent) => agent.onchainRegistrationTxHash).length;

  return (
    <div className="w-full ">
      <section className="overflow-hidden bg-[#050816]">
        <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden">
              <Image src="/logo-main.png" alt="Bat Agents" fill sizes="40px" className="object-contain" />
            </span>
            <span className="text-sm font-semibold tracking-[0.28em] text-white sm:text-base">
              BAT AGENTS
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {[
              { href: "#marketplace", label: "Marketplace" },
              { href: "#create", label: "Create Agent" },
              { href: "/dashboard", label: "Dashboard" },
              { href: "#about", label: "About" },
              { href: "#docs", label: "Docs" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-slate-300 transition hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Theme"
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/20 hover:bg-white/10 sm:inline-flex"
            >
              <Sparkles className="h-4 w-4" />
            </button>
            <Link
              href="/login"
              className="inline-flex items-center rounded-full bg-[linear-gradient(135deg,#8b5cf6,#5b7cfa)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(91,124,250,0.35)] transition hover:opacity-95"
            >
              Connect Wallet
            </Link>
          </div>
        </div>

        <div className="grid gap-10 px-5 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8 lg:py-10">
          <div className="max-w-2xl">
            <div className="inline-flex rounded-full border border-[#6d4dfd]/30 bg-[#6d4dfd]/12 px-4 py-2 text-xs font-medium tracking-[0.18em] text-[#b6a3ff]">
              AI AGENTS - REAL OWNERSHIP - REAL VALUE
            </div>

            <h1 className="mt-7 max-w-xl text-[3rem] font-semibold leading-[0.95] tracking-tight text-white sm:text-[4.25rem]">
              Own, Mint, and{" "}
              <span className="text-[#8b5cf6]">Monetize AI Agents</span>
            </h1>

            <p className="mt-6 max-w-xl text-[1.05rem] leading-8 text-slate-300">
              Bat Agents is an OG-powered marketplace where creators turn AI agents into ownable digital assets and earn every time they&apos;re used.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#7c4dff,#5b7cfa)] px-6 py-4 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(91,124,250,0.3)] transition hover:opacity-95"
              >
                Explore Marketplace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/create-agent"
                className="inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10"
              >
                Create Agent
                <MoveRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                {["A", "B", "C", "D", "E"].map((label, index) => (
                  <div
                    key={label}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[11px] font-semibold text-white ring-2 ring-[#050816]",
                      index % 2 === 0 ? "bg-slate-700" : "bg-slate-500",
                    )}
                  >
                    {label}
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-300">
                Join <span className="text-[#b68cff]">creators and builders</span>
              </p>
            </div>
          </div>

          <div className="relative min-h-[540px]">
            <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_50%_35%,rgba(126,87,255,0.18),transparent_28%),radial-gradient(circle_at_50%_50%,rgba(91,124,250,0.16),transparent_42%),linear-gradient(180deg,rgba(11,15,31,0.4),rgba(5,8,22,0.85))]" />
            <div className="absolute inset-0 opacity-95">
              <HomeHeroScene />
            </div>

            <div className="absolute left-[10%] top-[8%] w-[210px] bg-[#0b1021]/90 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
              <HeroFloatCard title="Code Assistant" subtitle="by 0xDev" price="0.08 OG/day" />
            </div>
            <div className="absolute right-[4%] top-[10%] w-[210px] bg-[#0b1021]/90 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
              <HeroFloatCard title="Research Agent" subtitle="by 0xIntel" price="0.05 OG/day" accent />
            </div>
            <div className="absolute left-[18%] top-[48%] w-[210px] bg-[#0b1021]/90 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
              <HeroFloatCard title="Content Writer" subtitle="by 0xSage" price="0.04 OG/day" />
            </div>
            <div className="absolute right-[6%] top-[50%] w-[210px] bg-[#0b1021]/90 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
              <HeroFloatCard title="DeFi Analyst" subtitle="by 0xAlpha" price="0.07 OG/day" accent />
            </div>

            <div className="absolute left-1/2 top-1/2 flex h-[290px] w-[290px] -translate-x-1/2 -translate-y-[52%] items-center justify-center rounded-full border border-[#7c4dff]/35 bg-[radial-gradient(circle,rgba(124,77,255,0.2),rgba(5,8,22,0.85)_62%)] shadow-[0_0_70px_rgba(124,77,255,0.25)]">
              <div className="absolute inset-0 rounded-full border border-[#8b5cf6]/25 shadow-[inset_0_0_50px_rgba(124,77,255,0.25)]" />
              <div className="relative flex h-[150px] w-[150px] items-center justify-center rounded-full border border-[#9d7bff]/30 bg-[#0b1021]/85 shadow-[0_0_35px_rgba(124,77,255,0.45)]">
                <Image src="/logo-main.png" alt="Bat Agents" fill sizes="150px" className="object-contain p-8" />
              </div>
            </div>

            <div className="absolute inset-x-8 bottom-4 rounded-[1.25rem] border border-white/10 bg-[#0b1021]/85 px-6 py-5 backdrop-blur">
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
                {[
                  { label: "Agents Minted", value: `${agents.length}` },
                  { label: "OG Stored", value: `${mintedCount}` },
                  { label: "Creators", value: "Live" },
                  { label: "Marketplace", value: "Open" },
                  { label: "Testnet", value: "Ready" },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <p className="text-lg font-semibold text-[#b7c7ff]">{item.value}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 bg-[#09101f]/85 p-5">
        <div className="grid gap-4 lg:grid-cols-5">
          {featurePillars.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white/3 px-5 py-6 text-center"
              >
                <div className="mx-auto flex h-11 w-11 items-center justify-center bg-[#132046] text-[#6ea3ff]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-[0.95rem] font-medium text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="create" className="mt-8 bg-[#050816] px-5 py-7 sm:px-7">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.4em] text-slate-500">How Bat Agents works</p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            Create. Mint. List. <span className="text-[#8b5cf6]">Earn.</span>
          </h2>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-4">
          {howItWorks.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.index} className="text-center">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm text-slate-300">
                  {step.index}
                </div>
                <div className="mx-auto mt-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#5b7cfa]/35 bg-[#121832] text-[#63a2ff] shadow-[0_0_30px_rgba(91,124,250,0.15)]">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-[1.05rem] font-medium text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{step.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="about" className="mt-8 bg-[#050816] p-5">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-[#080d1c] p-5">
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=80"
                alt="Developer working at multiple screens"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority={false}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,22,0.1),rgba(5,8,22,0.88))]" />
            </div>
          </div>

          <div className="bg-[#080d1c] p-5">
            <p className="text-[11px] uppercase tracking-[0.4em] text-slate-500">Built for creators</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Why Creators Choose Bat Agents
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Creators need ownership, pricing control, and a clean path to monetize work.
              Bat Agents packages the agent, its provenance, and its market listing into one premium storefront.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {creatorBullets.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="bg-white/5 p-4">
                    <div className="flex h-9 w-9 items-center justify-center bg-[#111936] text-[#8b5cf6]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="mt-3 text-sm font-medium text-white">{item.title}</h3>
                    <p className="mt-2 text-xs leading-6 text-slate-400">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 bg-[#050816] p-5">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="bg-[#080d1c] p-5">
            <p className="text-[11px] uppercase tracking-[0.4em] text-slate-500">Live agent universe</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              Explore the Agent Network
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
              A living ecosystem of AI agents, creators, and users connected on-chain.
            </p>
            <ul className="mt-6 grid gap-3">
              {networkBullets.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="flex h-6 w-6 items-center justify-center bg-[#111936] text-[#8b5cf6]">
                    <BadgeCheck className="h-3.5 w-3.5" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/marketplace"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
            >
              Explore Universe
              <MoveRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="bg-[#080d1c] p-4">
            <div className="relative min-h-[380px] overflow-hidden bg-[#050816]">
              <HomeHeroScene />
              <div className="absolute inset-x-4 bottom-4 grid gap-3 sm:grid-cols-4">
                {[
                  { label: "Agents Minted", value: `${agents.length}` },
                  { label: "OG Earned", value: `${mintedCount}` },
                  { label: "Creators", value: "Live" },
                  { label: "Interactions", value: "Active" },
                ].map((item) => (
                  <div key={item.label} className="bg-[#0b1021]/90 px-4 py-3 text-center">
                    <p className="text-base font-semibold text-[#b7c7ff]">{item.value}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="marketplace" className="mt-8 bg-[#050816] p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-slate-500">Browse marketplace</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Top AI Agents</h2>
          </div>
          <Link href="/marketplace" className="text-sm text-slate-300 transition hover:text-white">
            View all agents
          </Link>
        </div>

        <div className="mt-6">
          {featuredAgents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              {featuredAgents.map((agent, index) => (
                <AgentPreviewCard key={agent.id} agent={agent} rank={index + 1} />
              ))}
            </div>
          ) : (
            <div className="bg-white/5 p-6 text-sm text-slate-400">
              No listed agents yet. Create and list the first agent to populate this section.
            </div>
          )}
        </div>
      </section>

      <section className="mt-8 bg-[#050816] p-5">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="bg-[#080d1c] p-4">
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=80"
                alt="Creator working on multiple monitors"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,22,0.08),rgba(5,8,22,0.88))]" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#080d1c] p-5">
              <p className="text-[11px] uppercase tracking-[0.4em] text-slate-500">Built for creators</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">
                Ready to launch your AI Agent?
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Join the future of AI ownership and start earning today.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/create-agent"
                className="inline-flex items-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#7c4dff,#5b7cfa)] px-6 py-4 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(91,124,250,0.3)] transition hover:opacity-95"
              >
                Create Agent
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10"
              >
                Explore Marketplace
                <MoveRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="docs" className="mt-8 bg-[#050816] px-6 py-8 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden">
                <Image src="/logo-main.png" alt="Bat Agents" fill sizes="40px" className="object-contain" />
              </span>
              <div>
                <p className="text-sm font-semibold tracking-[0.28em] text-white">BAT AGENTS</p>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
              The first OG-powered marketplace for ownable, mintable and monetizable AI agents.
            </p>
          </div>

          <FooterColumn
            title="Product"
            links={[
              { label: "Marketplace", href: "/marketplace" },
              { label: "Create Agent", href: "/create-agent" },
              { label: "Dashboard", href: "/dashboard" },
              { label: "Pricing", href: "/marketplace" },
            ]}
          />
          <FooterColumn
            title="Resources"
            links={[
              { label: "Docs", href: "#" },
              { label: "Guides", href: "#" },
              { label: "API", href: "#" },
              { label: "OG Integration", href: "#" },
            ]}
          />
          <FooterColumn
            title="Company"
            links={[
              { label: "About", href: "#" },
              { label: "Blog", href: "#" },
              { label: "Careers", href: "#" },
              { label: "Contact", href: "#" },
            ]}
          />
          <div>
            <p className="text-sm font-medium text-white">Stay Updated</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Subscribe to get the latest updates on new features.
            </p>
            <div className="mt-4 flex rounded-2xl border border-white/10 bg-[#0b1021] p-1">
              <input
                aria-label="Email"
                placeholder="Enter your email"
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              />
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#7c4dff,#5b7cfa)] text-white"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroFloatCard({
  title,
  subtitle,
  price,
  accent = false,
}: {
  title: string;
  subtitle: string;
  price: string;
  accent?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center",
              accent
                ? "bg-[#14203a] text-[#71e8ff]"
                : "bg-[#10172b] text-[#b3c8ff]",
            )}
          >
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{title}</p>
            <p className="text-[11px] text-slate-400">{subtitle}</p>
          </div>
        </div>
        <BadgeCheck className={cn("h-4 w-4", accent ? "text-[#71e8ff]" : "text-[#9db0ff]")} />
      </div>
      <p className="text-sm text-slate-300">{price}</p>
    </div>
  );
}

function AgentPreviewCard({
  agent,
  rank,
}: {
  agent: Awaited<ReturnType<typeof getListedAgents>>[number];
  rank: number;
}) {
  return (
    <article className="bg-[#0a1020] p-3">
      <div className="relative aspect-[4/3] overflow-hidden bg-[radial-gradient(circle_at_50%_35%,rgba(124,77,255,0.18),transparent_34%),linear-gradient(180deg,rgba(18,24,42,0.95),rgba(8,13,28,1))]">
        <div className="absolute right-3 top-3 bg-[#0c1324]/90 px-2 py-1 text-[10px] text-slate-300">
          {rank}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-24 w-24 items-center justify-center bg-[#121934] text-[#7d8fff] shadow-[0_0_30px_rgba(91,124,250,0.2)]">
            <Bot className="h-10 w-10" />
          </div>
        </div>
      </div>
      <div className="px-1 pb-1 pt-4">
        <p className="text-sm font-medium text-white">{agent.name}</p>
        <p className="mt-1 text-xs text-slate-500">{agent.service}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
          <span>{agent.category}</span>
          <span>
            {agent.currency} {agent.price}
          </span>
        </div>
      </div>
    </article>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-white">{title}</p>
      <div className="mt-4 grid gap-3">
        {links.map((link) => (
          <Link key={link.label} href={link.href} className="text-sm text-slate-400 transition hover:text-white">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
