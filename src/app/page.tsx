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
  Zap,
} from "lucide-react";
import HomeHeroSceneClient from "@/components/home/home-hero-scene-client";
import CursorReactiveBackground from "@/components/home/cursor-reactive-background";
import ScrollReveal from "@/components/home/scroll-reveal";
import { getListedAgents } from "@/lib/db/agents";
import { cn } from "@/lib/utils";

const featurePillars = [
  {
    title: "NFT Ownership",
    description: "Turn each AI agent into a verifiable on-chain asset.",
    icon: LockKeyhole,
  },
  {
    title: "OG Infrastructure",
    description: "Built for decentralized storage, provenance, and scale.",
    icon: Orbit,
  },
  {
    title: "Creator Economy",
    description: "Package your knowledge into agents users can hire.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Testnet Ready",
    description: "A real demo flow built for judges, creators, and buyers.",
    icon: Sparkles,
  },
  {
    title: "Transparent Trust",
    description: "Metadata, ownership, and listing activity stay traceable.",
    icon: ShieldCheck,
  },
] as const;

const howItWorks = [
  {
    index: "01",
    title: "Create an AI Agent",
    description:
      "Define the agent name, category, pricing, instructions, and training prompt.",
    icon: Bot,
  },
  {
    index: "02",
    title: "Mint it as an NFT",
    description:
      "Register ownership and provenance through your connected wallet.",
    icon: Box,
  },
  {
    index: "03",
    title: "List on Marketplace",
    description:
      "Publish the agent so buyers can discover, inspect, and hire it.",
    icon: DatabaseZap,
  },
  {
    index: "04",
    title: "Earn from Usage",
    description:
      "Monetize every useful workflow your AI agent performs for users.",
    icon: CircleDollarSign,
  },
] as const;

const networkBullets = [
  "Real-time agent activity",
  "On-chain usage tracking",
  "Creator-owned intelligence",
  "Cross-agent collaboration",
] as const;

const creatorBullets = [
  {
    title: "True Ownership",
    description: "Own, trade, sell, or license the agent you created.",
    icon: LockKeyhole,
  },
  {
    title: "Monetize Your Skills",
    description: "Turn knowledge, prompts, and workflows into income.",
    icon: CircleDollarSign,
  },
  {
    title: "Composable Network",
    description: "Built around open agent listings and OG infrastructure.",
    icon: Orbit,
  },
  {
    title: "Discover & Hire",
    description: "Users can find specialized agents for real tasks quickly.",
    icon: BriefcaseBusiness,
  },
] as const;

const heroAgents = [
  {
    title: "Code Assistant",
    subtitle: "Debugs production issues",
    price: "0.08 OG/day",
  },
  {
    title: "Business Adviser",
    subtitle: "Validates startup ideas",
    price: "0.06 OG/day",
    accent: true,
  },
  {
    title: "DeFi Analyst",
    subtitle: "Explains token activity",
    price: "0.07 OG/day",
    accent: true,
  },
  {
    title: "Research Agent",
    subtitle: "Summarizes market data",
    price: "0.05 OG/day",
  },
] as const;

export default async function Home() {
  const agents = await getListedAgents();
  const featuredAgents = agents.slice(0, 6);
  const mintedCount = agents.filter(
    (agent) => agent.onchainRegistrationTxHash,
  ).length;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030712] text-white">
      <CursorReactiveBackground />
      <div className="relative z-10">
        <section className="relative isolate min-h-screen overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_18%,rgba(124,77,255,0.28),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(14,165,233,0.18),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(91,124,250,0.14),transparent_34%),linear-gradient(180deg,#050816_0%,#030712_100%)]" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.18]" />
          <div className="absolute left-1/2 top-0 -z-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#7c4dff]/15 blur-[120px]" />

          <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-6 lg:px-8">
            <Link href="/" className="group flex items-center gap-3">
              <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_35px_rgba(124,77,255,0.22)]">
                <Image
                  src="/logo-main.png"
                  alt="Bat Agents"
                  fill
                  sizes="44px"
                  className="object-contain p-1.5"
                />
              </span>
              <span className="text-sm font-semibold tracking-[0.3em] text-white sm:text-base">
                BAT AGENTS
              </span>
            </Link>

            <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur-xl lg:flex">
              {[
                { href: "#marketplace", label: "Marketplace" },
                { href: "#create", label: "Create" },
                { href: "/dashboard", label: "Dashboard" },
                { href: "#about", label: "About" },
                { href: "#docs", label: "Docs" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-full px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <Link
              href="/login"
              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_45px_rgba(0,0,0,0.24)] backdrop-blur-xl transition hover:border-[#8b5cf6]/60 hover:bg-white/[0.1] sm:px-5"
            >
              Connect Wallet
            </Link>
          </header>

          <div className="mx-auto grid min-h-[calc(100vh-92px)] max-w-7xl items-center gap-12 px-5 pb-16 pt-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-10">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c4b5fd] shadow-[0_0_35px_rgba(139,92,246,0.12)]">
                <span className="h-2 w-2 rounded-full bg-[#38bdf8] shadow-[0_0_18px_#38bdf8]" />
                OG-powered AI agent marketplace
              </div>

              <h1 className="mt-7 max-w-3xl text-[3.25rem] font-semibold leading-[0.92] tracking-[-0.06em] text-white sm:text-[4.7rem] lg:text-[5.2rem]">
                Mint AI Agents. Own Them.{" "}
                <span className="bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#38bdf8] bg-clip-text text-transparent">
                  Monetize Intelligence.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                Bat Agents is an OG-powered marketplace where creators turn AI
                agents into ownable digital assets, list them for users, and
                earn from real usage.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/marketplace"
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#8b5cf6,#5b7cfa_55%,#38bdf8)] px-6 py-4 text-sm font-semibold text-white shadow-[0_22px_55px_rgba(91,124,250,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_26px_70px_rgba(91,124,250,0.45)]"
                >
                  Explore Marketplace
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/create-agent"
                  className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/[0.06] px-6 py-4 text-sm font-semibold text-white backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.1]"
                >
                  Create Agent
                  <MoveRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
                {[
                  { label: "Listed Agents", value: agents.length },
                  { label: "Minted", value: mintedCount },
                  { label: "Network", value: "OG" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl"
                  >
                    <p className="text-xl font-semibold text-white">
                      {item.value}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-slate-500">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[560px] lg:min-h-[650px]">
              <div className="absolute inset-0 rounded-[2.25rem] border border-white/10 bg-white/[0.035] shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl" />
              <div className="absolute inset-0 rounded-[2.25rem] bg-[radial-gradient(circle_at_50%_35%,rgba(139,92,246,0.22),transparent_29%),radial-gradient(circle_at_50%_55%,rgba(56,189,248,0.13),transparent_40%)]" />
              <div className="absolute inset-0 opacity-95">
                <HomeHeroSceneClient />
              </div>

              <div className="absolute left-5 top-6 hidden w-[225px] rounded-2xl border border-white/10 bg-[#07111f]/75 p-4 shadow-[0_20px_70px_rgba(0,0,0,0.36)] backdrop-blur-xl sm:block lg:left-8">
                <HeroFloatCard {...heroAgents[0]} />
              </div>
              <div className="absolute right-5 top-14 hidden w-[225px] rounded-2xl border border-white/10 bg-[#07111f]/75 p-4 shadow-[0_20px_70px_rgba(0,0,0,0.36)] backdrop-blur-xl md:block lg:right-8">
                <HeroFloatCard {...heroAgents[1]} />
              </div>
              <div className="absolute bottom-28 left-7 hidden w-[225px] rounded-2xl border border-white/10 bg-[#07111f]/75 p-4 shadow-[0_20px_70px_rgba(0,0,0,0.36)] backdrop-blur-xl md:block">
                <HeroFloatCard {...heroAgents[2]} />
              </div>
              <div className="absolute bottom-32 right-7 hidden w-[225px] rounded-2xl border border-white/10 bg-[#07111f]/75 p-4 shadow-[0_20px_70px_rgba(0,0,0,0.36)] backdrop-blur-xl lg:block">
                <HeroFloatCard {...heroAgents[3]} />
              </div>

              <div className="absolute inset-x-4 bottom-5 rounded-3xl border border-white/10 bg-[#050816]/80 p-4 backdrop-blur-2xl sm:inset-x-8 sm:p-5">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Agents", value: `${agents.length}` },
                    { label: "Minted", value: `${mintedCount}` },
                    { label: "Marketplace", value: "Open" },
                    { label: "Testnet", value: "Ready" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl bg-white/[0.04] px-4 py-3 text-center"
                    >
                      <p className="text-base font-semibold text-[#c4d7ff]">
                        {item.value}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#030712]/80 px-5 py-8 sm:px-7">
          <ScrollReveal className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 lg:grid-cols-5">
            {featurePillars.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group rounded-3xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#8b5cf6]/45 hover:bg-white/[0.06]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 text-[#a78bfa]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-sm font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </ScrollReveal>
        </section>

        <section
          id="create"
          className="relative bg-[#030712] px-5 py-20 sm:px-7"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/40 to-transparent" />
          <ScrollReveal>
            <SectionHeader
              eyebrow="How Bat Agents works"
              title="Create. Mint. List. Earn."
              highlight="Earn."
            />
          </ScrollReveal>

          <div className="mx-auto mt-12 grid max-w-7xl gap-5 lg:grid-cols-4">
            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <ScrollReveal
                  key={step.index}
                  delay={index * 90}
                  className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.065),rgba(255,255,255,0.028))] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.22)]"
                >
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#8b5cf6]/10 blur-2xl" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold tracking-[0.24em] text-[#94a3b8]">
                      {step.index}
                    </span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#38bdf8]/20 bg-[#38bdf8]/10 text-[#7dd3fc]">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="mt-8 text-lg font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {step.description}
                  </p>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        <section id="about" className="bg-[#030712] px-5 py-12 sm:px-7">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
            <ScrollReveal
              variant="left"
              className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-4"
            >
              <div className="relative min-h-[430px] overflow-hidden rounded-[1.5rem]">
                <Image
                  src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1600&q=80"
                  alt="Developer working at multiple screens"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,18,0.08),rgba(3,7,18,0.95))]" />
                <div className="absolute bottom-5 left-5 right-5 rounded-3xl border border-white/10 bg-[#030712]/70 p-5 backdrop-blur-xl">
                  <p className="text-sm font-semibold text-white">
                    Creator-first agent economy
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    A premium storefront for turning skills, prompts, and
                    workflows into ownable AI products.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal
              variant="right"
              delay={120}
              className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-8"
            >
              <p className="text-[11px] uppercase tracking-[0.4em] text-slate-500">
                Built for creators
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Launch agents people can trust, hire, and pay for.
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Bat Agents gives creators a cleaner path from idea to market:
                create a specialized agent, mint ownership, publish it, and let
                users discover it through a real marketplace.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {creatorBullets.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-3xl border border-white/10 bg-[#050816]/75 p-5 transition hover:border-[#8b5cf6]/40"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8b5cf6]/10 text-[#a78bfa]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-sm font-semibold text-white">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="bg-[#030712] px-5 py-12 sm:px-7">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.4em] text-slate-500">
                Live agent universe
              </p>
              <h2 className="mt-4 text-3xl font-semibold text-white sm:text-5xl">
                A network of useful AI agents.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                Every listed agent becomes part of a growing creator-owned
                ecosystem connected by usage, reputation, and on-chain
                ownership.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {networkBullets.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#050816]/70 px-4 py-3 text-sm text-slate-300"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#8b5cf6]/10 text-[#a78bfa]">
                      <BadgeCheck className="h-4 w-4" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/marketplace"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.1]"
              >
                Explore Universe
                <MoveRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative min-h-[430px] overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_50%_35%,rgba(139,92,246,0.2),transparent_30%),#050816]">
              <HomeHeroSceneClient />
              <div className="absolute inset-x-4 bottom-4 grid gap-3 sm:grid-cols-4">
                {[
                  { label: "Agents", value: `${agents.length}` },
                  { label: "Minted", value: `${mintedCount}` },
                  { label: "Creators", value: "Live" },
                  { label: "Usage", value: "Active" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-[#030712]/80 px-4 py-3 text-center backdrop-blur-xl"
                  >
                    <p className="text-base font-semibold text-[#c4d7ff]">
                      {item.value}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative bg-[#030712] px-5 py-20 sm:px-7">
          <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#38bdf8]/30 to-transparent" />
          <ScrollReveal className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.25),transparent_30%),radial-gradient(circle_at_80%_70%,rgba(56,189,248,0.15),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] p-6 shadow-[0_35px_120px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div>
                <p className="text-[11px] uppercase tracking-[0.42em] text-[#7dd3fc]">
                  World-impact agent economy
                </p>
                <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-5xl">
                  A marketplace where knowledge becomes work, ownership, and
                  income.
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  Bat Agents is designed for the next wave of creators: people
                  who can package expertise into useful AI workers, prove
                  ownership on-chain, and give buyers access to specialized help
                  at any scale.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { value: "01", label: "Create useful intelligence" },
                  { value: "02", label: "Prove ownership on OG" },
                  { value: "03", label: "Let the market hire it" },
                ].map((item) => (
                  <div
                    key={item.value}
                    className="group rounded-[2rem] border border-white/10 bg-[#030712]/55 p-5 transition hover:-translate-y-1 hover:border-[#38bdf8]/35 hover:bg-white/[0.06]"
                  >
                    <p className="bg-gradient-to-r from-[#c4b5fd] to-[#7dd3fc] bg-clip-text text-4xl font-semibold text-transparent">
                      {item.value}
                    </p>
                    <p className="mt-5 text-sm leading-6 text-slate-300">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>

        <section id="marketplace" className="bg-[#030712] px-5 py-16 sm:px-7">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.4em] text-slate-500">
                  Browse marketplace
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
                  Top AI Agents
                </h2>
              </div>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
              >
                View all agents
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8">
              {featuredAgents.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {featuredAgents.map((agent, index) => (
                    <AgentPreviewCard
                      key={agent.id}
                      agent={agent}
                      rank={index + 1}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/[0.035] p-8 text-sm text-slate-400">
                  No listed agents yet. Create and list the first agent to
                  populate this section.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="bg-[#030712] px-5 py-16 sm:px-7">
          <div className="mx-auto grid max-w-7xl gap-6 rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.2),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:grid-cols-[1fr_0.9fr] lg:items-center lg:p-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-slate-500">
                Launch your agent
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
                Ready to turn your intelligence into an asset?
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Create a specialized AI agent, mint it, list it, and let buyers
                use it from the marketplace.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
              <Link
                href="/create-agent"
                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#8b5cf6,#5b7cfa)] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(91,124,250,0.32)] transition hover:-translate-y-0.5"
              >
                Create Agent
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/[0.06] px-6 py-4 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.1]"
              >
                Explore Marketplace
                <MoveRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <footer
          id="docs"
          className="border-t border-white/10 bg-[#030712] px-6 py-10 sm:px-8"
        >
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_1.1fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                  <Image
                    src="/logo-main.png"
                    alt="Bat Agents"
                    fill
                    sizes="44px"
                    className="object-contain p-1.5"
                  />
                </span>
                <p className="text-sm font-semibold tracking-[0.28em] text-white">
                  BAT AGENTS
                </p>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
                The OG-powered marketplace for ownable, mintable, and
                monetizable AI agents.
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
                { label: "About", href: "#about" },
                { label: "Blog", href: "#" },
                { label: "Careers", href: "#" },
                { label: "Contact", href: "#" },
              ]}
            />

            <div>
              <p className="text-sm font-medium text-white">Stay Updated</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Subscribe to get updates as new agent features ship.
              </p>
              <div className="mt-4 flex rounded-2xl border border-white/10 bg-[#050816] p-1">
                <input
                  aria-label="Email"
                  placeholder="Enter your email"
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                />
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#8b5cf6,#5b7cfa)] text-white"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

function SectionHeader({
  eyebrow,
  title,
  highlight,
}: {
  eyebrow: string;
  title: string;
  highlight: string;
}) {
  const plain = title.replace(highlight, "").trim();

  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-[11px] uppercase tracking-[0.4em] text-slate-500">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
        {plain}{" "}
        <span className="bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8] bg-clip-text text-transparent">
          {highlight}
        </span>
      </h2>
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
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl border",
              accent
                ? "border-[#38bdf8]/20 bg-[#38bdf8]/10 text-[#7dd3fc]"
                : "border-[#8b5cf6]/25 bg-[#8b5cf6]/10 text-[#c4b5fd]",
            )}
          >
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="mt-1 text-[11px] text-slate-400">{subtitle}</p>
          </div>
        </div>
        <BadgeCheck
          className={cn(
            "mt-1 h-4 w-4",
            accent ? "text-[#7dd3fc]" : "text-[#a78bfa]",
          )}
        />
      </div>
      <div className="flex items-center justify-between rounded-xl bg-white/[0.045] px-3 py-2 text-xs text-slate-300">
        <span>Usage price</span>
        <span className="font-semibold text-white">{price}</span>
      </div>
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
    <article className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#8b5cf6]/45 hover:bg-white/[0.06]">
      <div className="relative aspect-[16/11] overflow-hidden rounded-[1.5rem] bg-[radial-gradient(circle_at_50%_35%,rgba(124,77,255,0.28),transparent_34%),linear-gradient(180deg,rgba(18,24,42,0.95),rgba(5,8,22,1))]">
        <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-[#030712]/70 px-3 py-1 text-[10px] text-slate-300 backdrop-blur-xl">
          #{rank}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 text-[#a78bfa] shadow-[0_0_45px_rgba(139,92,246,0.24)] transition group-hover:scale-105">
            <Bot className="h-10 w-10" />
          </div>
        </div>
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-[#38bdf8]/20 bg-[#38bdf8]/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#7dd3fc]">
          <Zap className="h-3 w-3" /> Listed
        </div>
      </div>

      <div className="px-1 pb-1 pt-5">
        <p className="text-base font-semibold text-white">{agent.name}</p>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">
          {agent.service}
        </p>
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-[#050816]/70 px-4 py-3 text-sm text-slate-300">
          <span>{agent.category}</span>
          <span className="font-semibold text-white">
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
          <Link
            key={link.label}
            href={link.href}
            className="text-sm text-slate-400 transition hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
