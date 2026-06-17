import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
};

export default function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        </div>
        <Icon className="h-5 w-5 text-cyan-300" />
      </div>
      {detail ? <p className="mt-3 text-sm leading-6 text-slate-400">{detail}</p> : null}
    </article>
  );
}
