import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  children: ReactNode;
  tone?:
    | "neutral"
    | "cyan"
    | "emerald"
    | "amber"
    | "rose"
    | "violet";
};

const toneStyles: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  neutral: "border-white/10 bg-white/5 text-slate-200",
  cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
  emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
  amber: "border-amber-400/20 bg-amber-400/10 text-amber-100",
  rose: "border-rose-400/20 bg-rose-400/10 text-rose-100",
  violet: "border-violet-400/20 bg-violet-400/10 text-violet-100",
};

export default function StatusBadge({
  children,
  tone = "neutral",
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em]",
        toneStyles[tone],
      )}
    >
      {children}
    </span>
  );
}
