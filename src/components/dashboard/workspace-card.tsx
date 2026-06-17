import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import StatusBadge from "@/components/ui/status-badge";

type WorkspaceStat = {
  label: string;
  value: string;
};

type WorkspaceCardProps = {
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: LucideIcon;
  stats: WorkspaceStat[];
  tone?: "cyan" | "emerald" | "violet";
};

const toneStyles: Record<NonNullable<WorkspaceCardProps["tone"]>, string> = {
  cyan: "border-cyan-400/20 bg-cyan-400/5",
  emerald: "border-emerald-400/20 bg-emerald-400/5",
  violet: "border-violet-400/20 bg-violet-400/5",
};

export default function WorkspaceCard({
  title,
  description,
  href,
  cta,
  icon: Icon,
  stats,
  tone = "cyan",
}: WorkspaceCardProps) {
  return (
    <article
      className={`flex h-full flex-col rounded-[1.75rem] border p-5 ${toneStyles[tone]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Workspace</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">{title}</h2>
        </div>
        <StatusBadge tone={tone === "cyan" ? "cyan" : tone === "emerald" ? "emerald" : "violet"}>
          {tone === "cyan" ? "Buyer" : tone === "emerald" ? "Creator" : "Superadmin"}
        </StatusBadge>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-300">{description}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <p className="text-[11px] uppercase tracking-[0.26em] text-slate-500">{stat.label}</p>
            <p className="mt-2 text-lg font-semibold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Icon className="h-5 w-5 text-cyan-300" />
        <Link
          href={href}
          className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
        >
          {cta}
        </Link>
      </div>
    </article>
  );
}
