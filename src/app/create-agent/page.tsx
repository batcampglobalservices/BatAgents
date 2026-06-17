import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, Coins, ShieldCheck } from "lucide-react";
import Link from "next/link";
import CreateAgentForm from "@/components/agents/create-agent-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <Card className="border-white/10 bg-slate-950/60 text-white">
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Creator publish flow</p>
            <CardTitle className="mt-2 text-3xl text-white">Create an agent that ships like a product.</CardTitle>
            <CardDescription className="text-slate-300">
              Draft the profile, store metadata, register on Starknet Sepolia, and make it available in the marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Metadata proof", icon: BadgeCheck },
              { label: "Onchain registration", icon: ShieldCheck },
              { label: "Paid hiring", icon: Coins },
              { label: "Marketplace listing", icon: ArrowRight },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Icon className="h-4 w-4 text-cyan-300" />
                  <p className="mt-3 text-sm font-medium text-white">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Built to match the live buyer and creator workflow.
                  </p>
                </div>
              );
            })}
          </CardContent>
          <div className="px-6 pb-6">
            <Link
              href="/dashboard/creator"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:bg-white/10"
            >
              Open creator dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>

        <div>
          <CreateAgentForm initialAgent={initialAgent} />
        </div>
      </div>
    </section>
  );
}
